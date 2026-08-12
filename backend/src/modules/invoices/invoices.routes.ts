import { Router } from 'express';
import * as invoicesController from './invoices.controller';
import { createInvoiceSchema, getInvoicesQuerySchema } from './invoices.schema';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';

const router = Router();

router.use(authenticate);

// Generate Invoice
router.post(
  '/',
  authorize('ADMIN', 'SALES'),
  validateRequest(createInvoiceSchema),
  invoicesController.createInvoice
);

// List Invoices
router.get(
  '/',
  authorize('ADMIN', 'SALES', 'ACCOUNTS'),
  invoicesController.getInvoices
);

// Get Invoice by ID
router.get(
  '/:id',
  authorize('ADMIN', 'SALES', 'ACCOUNTS'),
  invoicesController.getInvoiceById
);

// Generate PDF
router.get(
  '/:id/pdf',
  authorize('ADMIN', 'SALES', 'ACCOUNTS'),
  invoicesController.generateInvoicePdf
);

export default router;
