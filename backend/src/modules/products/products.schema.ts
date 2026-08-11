import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  currentStock: z.number().int().min(0).optional(),
  minStockAlert: z.number().int().min(0).optional(),
  location: z.string().min(1, "Location is required"),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  minStockAlert: z.number().int().min(0).optional(),
  location: z.string().min(1, "Location is required"),
});
