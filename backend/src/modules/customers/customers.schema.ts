import { z } from 'zod';
import { CustomerType, CustomerStatus } from '@prisma/client';

const emptyToNull = (val: unknown) => (val === '' || val === undefined ? null : val);

export const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
  email: z.preprocess(emptyToNull, z.string().email('Invalid email').nullable().optional()),
  businessName: z.string().min(1, 'Business name is required'),
  gstNumber: z.preprocess(emptyToNull, z.string().nullable().optional()),
  customerType: z.nativeEnum(CustomerType),
  address: z.string().min(1, 'Address is required'),
  status: z.nativeEnum(CustomerStatus).optional().default(CustomerStatus.LEAD),
  followUpDate: z.preprocess(emptyToNull, z.string().nullable().optional()),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(1).optional(),
  mobile: z.string().min(1).optional(),
  email: z.preprocess(emptyToNull, z.string().email('Invalid email').nullable().optional()),
  businessName: z.string().min(1).optional(),
  gstNumber: z.preprocess(emptyToNull, z.string().nullable().optional()),
  customerType: z.nativeEnum(CustomerType).optional(),
  address: z.string().min(1).optional(),
  status: z.nativeEnum(CustomerStatus).optional(),
  followUpDate: z.preprocess(emptyToNull, z.string().nullable().optional()),
});

export const createCustomerNoteSchema = z.object({
  note: z.string().min(1, 'Note content is required'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateCustomerNoteInput = z.infer<typeof createCustomerNoteSchema>;
