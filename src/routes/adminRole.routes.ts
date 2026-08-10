import { Router } from 'express';
import * as adminRoleController from '../controllers/adminRole.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Protect all role routes - Admin only
router.use(protect, restrictTo('admin'));

router.get('/', adminRoleController.getAllRoles);
router.post('/', adminRoleController.createRole);
router.patch('/:id', adminRoleController.updateRole);
router.delete('/:id', adminRoleController.deleteRole);

export default router;
