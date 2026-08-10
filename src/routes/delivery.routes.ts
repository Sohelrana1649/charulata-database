import { Router } from 'express';
import * as deliveryController from '../controllers/delivery.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public district shipping charge lookups (can be used during guest checkout/cart calculations)
router.get('/charge', deliveryController.getShippingCharge);
router.get('/districts', deliveryController.getDistricts);

// Protected Admin / Staff routes
router.use(protect, restrictTo('admin', 'staff'));

router.get('/zones', deliveryController.getAllZones);
router.post('/zones', deliveryController.createOrUpdateZone);
router.delete('/zones/:id', deliveryController.deleteZone);

export default router;
