import { Router } from 'express';
import * as attributeController from '../controllers/attribute.controller';
import { protect, restrictTo } from '../middlewares/auth';

const router = Router();

// Public route — admin form needs to fetch attribute values
router.get('/', attributeController.getAllAttributes);

// Protected Admin / Staff routes
router.use(protect, restrictTo('admin', 'staff'));

router.post('/', attributeController.createAttribute);
router.patch('/:id', attributeController.updateAttribute);
router.post('/:id/values', attributeController.addAttributeValue);
router.delete('/:id/values', attributeController.removeAttributeValue);
router.delete('/:id', attributeController.deleteAttribute);

export default router;
