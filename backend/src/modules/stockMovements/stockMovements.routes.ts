import { Router } from 'express';
import * as stockMovementsController from './stockMovements.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Read routes: open to all authenticated users
router.get('/', authenticate, stockMovementsController.getStockMovements);

// Write routes: restricted to ADMIN and WAREHOUSE
router.post('/', authenticate, authorize('ADMIN', 'WAREHOUSE'), stockMovementsController.createStockMovement);

export default router;
