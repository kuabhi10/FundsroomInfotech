import { Router } from 'express';
import { getUsers, createUser, updateUser, updateUserStatus } from './users.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// All user management routes require ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/status', updateUserStatus);

export default router;
