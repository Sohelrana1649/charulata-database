import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Protect all routes
router.use(protect);

// Address Management
router.post('/addresses', userController.addAddress);
router.patch('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);

// Profile Management
router.patch('/profile', userController.updateProfile);
router.patch('/change-password', userController.changePassword);

// Wishlist Management
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist', userController.addToWishlist);
router.delete('/wishlist/:productId', userController.removeFromWishlist);

// Administrative User Management
router.get('/admin/all', restrictTo('staff', 'admin', 'super_admin'), userController.getAllUsersAdmin);
router.patch('/admin/:userId/role', restrictTo('admin', 'super_admin'), userController.updateUserRoleAdmin);

export default router;
