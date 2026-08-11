import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getStockMovements = async (filters: any, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
    if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
  }

  const [total, data] = await Promise.all([
    prisma.stockMovement.count({ where }),
    prisma.stockMovement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true, sku: true }
        },
        createdBy: {
          select: { name: true }
        }
      }
    })
  ]);

  return { data, total, page, limit };
};

export const createStockMovement = async (data: any, userId: string) => {
  return prisma.$transaction(async (tx) => {
    // Lock the product row for update to prevent concurrent modification issues
    // Prisma doesn't have explicit row locks in findUnique, so we might rely on the transaction isolation or raw query if high concurrency is expected.
    // For MVP, checking and updating in a transaction is usually sufficient if it's serializable, but default isolation might be read committed.
    // Let's do a simple read then update, since it's a single transaction.
    
    const product = await tx.product.findUnique({
      where: { id: data.productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    let newStock = product.currentStock;

    if (data.type === 'IN') {
      newStock += data.quantity;
    } else if (data.type === 'OUT') {
      newStock -= data.quantity;
      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }
    }

    const movement = await tx.stockMovement.create({
      data: {
        productId: data.productId,
        quantity: data.quantity,
        type: data.type,
        reason: data.reason,
        createdById: userId,
      }
    });

    await tx.product.update({
      where: { id: data.productId },
      data: { currentStock: newStock }
    });

    return movement;
  });
};
