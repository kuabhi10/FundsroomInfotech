import { Router } from 'express';
import * as challansController from './challans.controller';
import { createChallanSchema, updateChallanSchema } from './challans.schema';
import { authenticate, authorize } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validate';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('ADMIN', 'SALES', 'WAREHOUSE'),
  validateRequest(createChallanSchema),
  challansController.createChallan
);

router.get(
  '/',
  authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  challansController.getChallans
);

router.get(
  '/:id',
  authorize('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'),
  challansController.getChallanById
);

router.put(
  '/:id',
  authorize('ADMIN', 'SALES', 'WAREHOUSE'),
  validateRequest(updateChallanSchema),
  challansController.updateChallan
);

router.patch(
  '/:id/confirm',
  authorize('ADMIN', 'SALES', 'WAREHOUSE'),
  challansController.confirmChallan
);

router.patch(
  '/:id/cancel',
  authorize('ADMIN', 'SALES', 'WAREHOUSE'),
  challansController.cancelChallan
);

export default router;
