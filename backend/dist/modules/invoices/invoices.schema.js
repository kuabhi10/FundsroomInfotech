"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoicesQuerySchema = exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
exports.createInvoiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        challanId: zod_1.z.string().uuid({ message: 'Invalid challan ID format' }),
    }),
});
exports.getInvoicesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        customerId: zod_1.z.string().uuid().optional(),
        dateFrom: zod_1.z.string().optional(),
        dateTo: zod_1.z.string().optional(),
        page: zod_1.z.string().regex(/^\d+$/).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).optional(),
    }),
});
