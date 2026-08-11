import { PrismaClient, ChallanStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Utility to generate the next challan number safely using the sequence table
async function generateChallanNumber(): Promise<string> {
  const sequence = await prisma.challanSequence.create({
    data: {},
  });
  
  // Pad with leading zeros, e.g., CH-0001
  const paddedId = String(sequence.id).padStart(4, '0');
  return `CH-${paddedId}`;
}

export const createChallan = async (
  customerId: string,
  status: ChallanStatus,
  items: { productId: string; quantity: number }[],
  createdById: string
) => {
  // Capture Customer snapshot
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    throw { status: 404, message: 'Customer not found' };
  }
  const customerSnapshot = {
    name: customer.name,
    mobile: customer.mobile,
    businessName: customer.businessName,
  };

  // Fetch Products for snapshot and stock checks
  const productIds = items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });

  const productMap = new Map(products.map(p => [p.id, p]));

  // Build items array with snapshots and line totals
  let totalQuantity = 0;
  let totalAmount = 0;
  
  const challanItemsInput = items.map(item => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw { status: 400, message: `Product with ID ${item.productId} not found` };
    }
    
    const lineTotal = Number(product.unitPrice) * item.quantity;
    totalQuantity += item.quantity;
    totalAmount += lineTotal;
    
    return {
      productId: product.id,
      quantity: item.quantity,
      lineTotal,
      productSnapshot: {
        name: product.name,
        sku: product.sku,
        unitPrice: product.unitPrice,
      },
    };
  });

  if (status === 'DRAFT') {
    // Save without stock check
    const challanNumber = await generateChallanNumber();
    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId,
        customerSnapshot,
        status: 'DRAFT',
        totalQuantity,
        totalAmount,
        createdById,
        items: {
          create: challanItemsInput,
        },
      },
      include: { items: true },
    });
    return challan;
  }

  // CONFIRMED Path: Execute in a transaction
  if (status === 'CONFIRMED') {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify and reduce stock for all items
      for (const item of items) {
        // Read current stock
        const p = await tx.product.findUnique({ where: { id: item.productId } });
        if (!p) throw { status: 400, message: `Product ${item.productId} not found` };
        
        if (p.currentStock < item.quantity) {
          throw { 
            status: 400, 
            message: `Insufficient stock for product ${p.name}. Requested: ${item.quantity}, Available: ${p.currentStock}`,
            details: { productId: p.id, requested: item.quantity, available: p.currentStock }
          };
        }
        
        // Decrement stock atomically with a WHERE condition to prevent concurrent write-skew
        const updateResult = await tx.product.updateMany({
          where: { 
            id: p.id,
            currentStock: { gte: item.quantity }
          },
          data: { currentStock: { decrement: item.quantity } },
        });

        if (updateResult.count === 0) {
          throw { 
            status: 400, 
            message: `Concurrent update error: Insufficient stock for product ${p.name} at time of write.`,
            details: { productId: p.id, requested: item.quantity }
          };
        }
      }

      // 2. Generate Challan Number
      // Using a raw query or creating on main client since sequences don't strictly need to be in the tx 
      // but to be safe we use the main client inside the function or a raw insert if Prisma doesn't support nested client.
      // Wait, we can just use the tx client to create the sequence.
      const sequence = await tx.challanSequence.create({ data: {} });
      const challanNumber = `CH-${String(sequence.id).padStart(4, '0')}`;

      // 3. Create Challan and Items
      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          customerSnapshot,
          status: 'CONFIRMED',
          totalQuantity,
          totalAmount,
          createdById,
          items: {
            create: challanItemsInput,
          },
        },
        include: { items: true },
      });

      // 4. Create StockMovements
      const stockMovements = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        type: 'OUT' as const,
        reason: `Challan #${challanNumber}`,
        createdById,
      }));
      
      await tx.stockMovement.createMany({
        data: stockMovements,
      });

      return challan;
    });
  }
};

export const getChallans = async (filters: any) => {
  const { status, customerId, dateFrom, dateTo, page = '1', limit = '20' } = filters;
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = parseInt(limit, 10) || 20;
  const skip = (pageNumber - 1) * pageSize;

  const where: any = {};
  if (status) where.status = status;
  if (customerId) where.customerId = customerId;
  
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { name: true, businessName: true } } },
    }),
    prisma.challan.count({ where }),
  ]);

  return { data, total, page: pageNumber, limit: pageSize };
};

export const getChallanById = async (id: string) => {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      items: true,
      customer: { select: { name: true, email: true, mobile: true, businessName: true, address: true, gstNumber: true } },
    },
  });

  if (!challan) throw { status: 404, message: 'Challan not found' };
  return challan;
};

export const updateChallan = async (
  id: string,
  data: { customerId?: string; items?: { productId: string; quantity: number }[] }
) => {
  // Check if DRAFT
  const existing = await prisma.challan.findUnique({ where: { id }, include: { items: true } });
  if (!existing) throw { status: 404, message: 'Challan not found' };
  if (existing.status !== 'DRAFT') {
    throw { status: 400, message: 'Only DRAFT challans can be edited' };
  }

  // To update a draft completely, it's easier to rebuild items and snapshots.
  // Assuming a full replacement of items if provided.
  let updateData: any = {};
  
  if (data.customerId && data.customerId !== existing.customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw { status: 404, message: 'Customer not found' };
    updateData.customerId = data.customerId;
    updateData.customerSnapshot = {
      name: customer.name,
      mobile: customer.mobile,
      businessName: customer.businessName,
    };
  }

  if (data.items) {
    const productIds = data.items.map(item => item.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map(p => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;
    
    const challanItemsInput = data.items.map(item => {
      const product = productMap.get(item.productId);
      if (!product) throw { status: 400, message: `Product with ID ${item.productId} not found` };
      
      const lineTotal = Number(product.unitPrice) * item.quantity;
      totalQuantity += item.quantity;
      totalAmount += lineTotal;
      
      return {
        productId: product.id,
        quantity: item.quantity,
        lineTotal,
        productSnapshot: {
          name: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
        },
      };
    });

    updateData.totalQuantity = totalQuantity;
    updateData.totalAmount = totalAmount;
    
    return await prisma.$transaction(async (tx) => {
      // delete old items
      await tx.challanItem.deleteMany({ where: { challanId: id } });
      
      // update challan and add new items
      return await tx.challan.update({
        where: { id },
        data: {
          ...updateData,
          items: {
            create: challanItemsInput,
          },
        },
        include: { items: true },
      });
    });
  } else if (Object.keys(updateData).length > 0) {
    return await prisma.challan.update({
      where: { id },
      data: updateData,
      include: { items: true },
    });
  }

  return existing;
};

export const confirmChallan = async (id: string, userId: string) => {
  return await prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: { items: true },
    });
    
    if (!challan) throw { status: 404, message: 'Challan not found' };
    if (challan.status !== 'DRAFT') throw { status: 400, message: 'Only DRAFT challans can be confirmed' };

    // Verify and reduce stock
    for (const item of challan.items) {
      const p = await tx.product.findUnique({ where: { id: item.productId } });
      if (!p) throw { status: 400, message: `Product ${item.productId} not found` };
      
      if (p.currentStock < item.quantity) {
        throw { 
          status: 400, 
          message: `Insufficient stock for product ${p.name}. Requested: ${item.quantity}, Available: ${p.currentStock}`,
          details: { productId: p.id, requested: item.quantity, available: p.currentStock }
        };
      }
      
      // Decrement stock atomically with a WHERE condition
      const updateResult = await tx.product.updateMany({
        where: { 
          id: p.id,
          currentStock: { gte: item.quantity }
        },
        data: { currentStock: { decrement: item.quantity } },
      });

      if (updateResult.count === 0) {
        throw { 
          status: 400, 
          message: `Concurrent update error: Insufficient stock for product ${p.name} at time of write.`,
          details: { productId: p.id, requested: item.quantity }
        };
      }
    }

    // Update status
    const updatedChallan = await tx.challan.update({
      where: { id },
      data: { status: 'CONFIRMED' },
      include: { items: true },
    });

    // Create StockMovements
    const stockMovements = challan.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      type: 'OUT' as const,
      reason: `Challan #${challan.challanNumber}`,
      createdById: userId,
    }));
    
    await tx.stockMovement.createMany({
      data: stockMovements,
    });

    return updatedChallan;
  });
};

export const cancelChallan = async (id: string, userId: string) => {
  const existing = await prisma.challan.findUnique({ where: { id }, include: { items: true } });
  if (!existing) throw { status: 404, message: 'Challan not found' };
  if (existing.status === 'CANCELLED') throw { status: 400, message: 'Challan is already cancelled' };

  if (existing.status === 'DRAFT') {
    // Just update status, no stock involved
    return await prisma.challan.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  // If CONFIRMED, revert stock in a transaction
  if (existing.status === 'CONFIRMED') {
    return await prisma.$transaction(async (tx) => {
      // Revert stock
      for (const item of existing.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });
      }

      // Create StockMovement(IN)
      const stockMovements = existing.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        type: 'IN' as const,
        reason: `Challan #${existing.challanNumber} cancelled`,
        createdById: userId,
      }));
      
      await tx.stockMovement.createMany({
        data: stockMovements,
      });

      // Update status
      return await tx.challan.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });
  }
};
