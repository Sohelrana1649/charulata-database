import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/', contactController.submitContactForm);

// Protected Admin / Staff routes
router.use(protect, restrictTo('admin', 'staff'));
router.get('/', contactController.getAllContactMessages);
router.patch('/:id/read', contactController.markContactMessageRead);
router.delete('/:id', contactController.deleteContactMessage);

export default router;
