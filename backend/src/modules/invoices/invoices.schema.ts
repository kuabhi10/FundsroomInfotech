import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    challanId: z.string().uuid({ message: 'Invalid challan ID format' }),
  }),
});

export const getInvoicesQuerySchema = z.object({
  query: z.object({
    customerId: z.string().uuid().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
