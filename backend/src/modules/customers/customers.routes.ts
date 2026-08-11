import { Router } from 'express';
import {
  listCustomers,
  getCustomerDetails,
  createCustomer,
  updateCustomer,
  addCustomerNote,
} from './customers.controller';
import { validateRequest } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createCustomerNoteSchema,
} from './customers.schema';

const router = Router();

// All customer routes require authentication
router.use(authenticate);

// Read access is open to all authenticated roles
router.get('/', listCustomers);
router.get('/:id', getCustomerDetails);

// Write access is restricted to ADMIN and SALES roles
router.post(
  '/',
  authorize('ADMIN', 'SALES'),
  validateRequest(createCustomerSchema),
  createCustomer
);

router.put(
  '/:id',
  authorize('ADMIN', 'SALES'),
  validateRequest(updateCustomerSchema),
  updateCustomer
);

router.post(
  '/:id/notes',
  authorize('ADMIN', 'SALES'),
  validateRequest(createCustomerNoteSchema),
  addCustomerNote
);

export default router;
