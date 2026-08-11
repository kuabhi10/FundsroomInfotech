import { Router } from 'express';
import * as productsController from './products.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Read routes: open to all authenticated users
router.get('/', authenticate, productsController.getProducts);
router.get('/:id', authenticate, productsController.getProductById);

// Write routes: restricted to ADMIN and WAREHOUSE
router.post('/', authenticate, authorize('ADMIN', 'WAREHOUSE'), productsController.createProduct);
router.put('/:id', authenticate, authorize('ADMIN', 'WAREHOUSE'), productsController.updateProduct);

export default router;
