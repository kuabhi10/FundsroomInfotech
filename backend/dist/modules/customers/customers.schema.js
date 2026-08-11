"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCustomerNoteSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const emptyToNull = (val) => (val === '' || val === undefined ? null : val);
exports.createCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    mobile: zod_1.z.string().min(1, 'Mobile number is required'),
    email: zod_1.z.preprocess(emptyToNull, zod_1.z.string().email('Invalid email').nullable().optional()),
    businessName: zod_1.z.string().min(1, 'Business name is required'),
    gstNumber: zod_1.z.preprocess(emptyToNull, zod_1.z.string().nullable().optional()),
    customerType: zod_1.z.nativeEnum(client_1.CustomerType),
    address: zod_1.z.string().min(1, 'Address is required'),
    status: zod_1.z.nativeEnum(client_1.CustomerStatus).optional().default(client_1.CustomerStatus.LEAD),
    followUpDate: zod_1.z.preprocess(emptyToNull, zod_1.z.string().nullable().optional()),
});
exports.updateCustomerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    mobile: zod_1.z.string().min(1).optional(),
    email: zod_1.z.preprocess(emptyToNull, zod_1.z.string().email('Invalid email').nullable().optional()),
    businessName: zod_1.z.string().min(1).optional(),
    gstNumber: zod_1.z.preprocess(emptyToNull, zod_1.z.string().nullable().optional()),
    customerType: zod_1.z.nativeEnum(client_1.CustomerType).optional(),
    address: zod_1.z.string().min(1).optional(),
    status: zod_1.z.nativeEnum(client_1.CustomerStatus).optional(),
    followUpDate: zod_1.z.preprocess(emptyToNull, zod_1.z.string().nullable().optional()),
});
exports.createCustomerNoteSchema = zod_1.z.object({
    note: zod_1.z.string().min(1, 'Note content is required'),
});
