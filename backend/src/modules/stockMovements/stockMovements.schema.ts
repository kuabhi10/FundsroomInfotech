import { z } from 'zod';
import { MovementType } from '@prisma/client';

export const createStockMovementSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  type: z.nativeEnum(MovementType),
  reason: z.string().min(1, "Reason is required"),
});
