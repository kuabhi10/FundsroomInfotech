"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    sku: zod_1.z.string().min(1, "SKU is required"),
    category: zod_1.z.string().min(1, "Category is required"),
    unitPrice: zod_1.z.number().min(0, "Unit price must be positive"),
    currentStock: zod_1.z.number().int().min(0).optional(),
    minStockAlert: zod_1.z.number().int().min(0).optional(),
    location: zod_1.z.string().min(1, "Location is required"),
});
exports.updateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Name is required"),
    category: zod_1.z.string().min(1, "Category is required"),
    unitPrice: zod_1.z.number().min(0, "Unit price must be positive"),
    minStockAlert: zod_1.z.number().int().min(0).optional(),
    location: zod_1.z.string().min(1, "Location is required"),
});
