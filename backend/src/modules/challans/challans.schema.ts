import { z } from 'zod';

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID'),
  status: z.enum(['DRAFT', 'CONFIRMED']),
  items: z.array(
    z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })
  ).min(1, 'At least one item is required'),
});

export const updateChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID').optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid('Invalid product ID'),
      quantity: z.number().int().positive('Quantity must be positive'),
    })
  ).min(1, 'At least one item is required').optional(),
});

export const queryChallansSchema = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'CONFIRMED', 'CANCELLED']).optional(),
    customerId: z.string().uuid().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});
