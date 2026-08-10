import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { protect, restrictTo, optionalProtect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { createProductSchema, updateProductSchema } from '../validations/product.validation';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/suggestions', productController.getSearchSuggestions);
router.get('/:slug', optionalProtect, productController.getProductBySlug);

// Protected Admin / Staff routes
router.use(protect, restrictTo('admin', 'staff'));

router.post('/', validate(createProductSchema), productController.createProduct);
router.patch('/bulk-update', productController.bulkUpdateProducts);
router.delete('/bulk-delete', productController.bulkDeleteProducts);
router.patch('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
