"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStockMovementSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createStockMovementSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid("Invalid product ID"),
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1"),
    type: zod_1.z.nativeEnum(client_1.MovementType),
    reason: zod_1.z.string().min(1, "Reason is required"),
});
