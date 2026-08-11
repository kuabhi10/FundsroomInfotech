"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSkuExists = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProducts = async (filters, page, limit) => {
    const skip = (page - 1) * limit;
    const where = {};
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
    }
    else {
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
exports.getProducts = getProducts;
const getProductById = async (id) => {
    return prisma.product.findUnique({
        where: { id },
    });
};
exports.getProductById = getProductById;
const createProduct = async (data) => {
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
exports.createProduct = createProduct;
const updateProduct = async (id, data) => {
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
exports.updateProduct = updateProduct;
const checkSkuExists = async (sku) => {
    const existing = await prisma.product.findUnique({ where: { sku } });
    return !!existing;
};
exports.checkSkuExists = checkSkuExists;
