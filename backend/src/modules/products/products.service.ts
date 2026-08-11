import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProducts = async (filters: any, page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  if (filters.category) {
    where.category = filters.category;
  }

  let products;
  let total;

  if (filters.lowStock === 'true' || filters.lowStock === true) {
    const allProducts = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
    const filtered = allProducts.filter(p => p.currentStock <= p.minStockAlert);
    total = filtered.length;
    products = filtered.slice(skip, skip + limit);
  } else {
    total = await prisma.product.count({ where });
    products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  return { data: products, total, page, limit };
};

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
  });
};

export const createProduct = async (data: any) => {
  return prisma.product.create({
    data: {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitPrice: data.unitPrice,
      currentStock: data.currentStock || 0,
      minStockAlert: data.minStockAlert || 0,
      location: data.location,
    },
  });
};

export const updateProduct = async (id: string, data: any) => {
  return prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      category: data.category,
      unitPrice: data.unitPrice,
      minStockAlert: data.minStockAlert,
      location: data.location,
    },
  });
};

export const checkSkuExists = async (sku: string) => {
  const existing = await prisma.product.findUnique({ where: { sku } });
  return !!existing;
};
