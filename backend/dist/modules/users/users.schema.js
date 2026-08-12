"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatusSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.nativeEnum(client_1.Role),
});
exports.updateUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required').optional(),
    email: zod_1.z.string().email('Invalid email address').optional(),
    role: zod_1.z.nativeEnum(client_1.Role).optional(),
});
exports.updateUserStatusSchema = zod_1.z.object({
    isActive: zod_1.z.boolean(),
});
