"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryChallansSchema = exports.updateChallanSchema = exports.createChallanSchema = void 0;
const zod_1 = require("zod");
exports.createChallanSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('Invalid customer ID'),
    status: zod_1.z.enum(['DRAFT', 'CONFIRMED']),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid('Invalid product ID'),
        quantity: zod_1.z.number().int().positive('Quantity must be positive'),
    })).min(1, 'At least one item is required'),
});
exports.updateChallanSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid('Invalid customer ID').optional(),
    items: zod_1.z.array(zod_1.z.object({
        productId: zod_1.z.string().uuid('Invalid product ID'),
        quantity: zod_1.z.number().int().positive('Quantity must be positive'),
    })).min(1, 'At least one item is required').optional(),
});
exports.queryChallansSchema = zod_1.z.object({
    query: zod_1.z.object({
        status: zod_1.z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']).optional(),
        customerId: zod_1.z.string().uuid().optional(),
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
    }),
});
