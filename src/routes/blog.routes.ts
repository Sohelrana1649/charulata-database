import { Router, Request } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import * as blogController from '../controllers/blog.controller';
import { protect, isAdmin } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  createBlogSchema,
  updateBlogSchema,
  reorderBlogImagesSchema,
} from '../validations/blog.validation';
import { config } from '../config';

// Multer memory storage for Cloudinary buffer upload
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed!'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per file
  },
});

// Support both coverImage (1 file) and images gallery (up to 10 files) in the same multipart request
const blogUploadFields = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

// Brute-force rate limiting for preview endpoint (token-guessing protection)
const previewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.nodeEnv === 'development' ? 500 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many preview attempts from this IP, please try again after 15 minutes',
  },
});

const router = Router();

// ==========================================
// 1. PUBLIC ROUTES
// ==========================================

// Get all published & active scheduled blogs (supports search, category, tag, pagination)
router.get('/', blogController.getAllBlogs);

// Get single Featured Story Blog for homepage (Public - defined before :slug)
router.get('/featured', blogController.getFeaturedBlog);

// Get draft/scheduled blog preview by token (Public token-gated - defined before :slug)
router.get('/preview/:slug', previewLimiter, blogController.getBlogPreview);

// ==========================================
// 2. ADMIN PROTECTED ROUTES (Must be defined before parameterized :slug)
// ==========================================

// Get all blogs for admin (all statuses, pagination, filtering)
router.get('/admin/all', protect, isAdmin, blogController.getAdminBlogs);

// Create new blog post (admin only)
router.post(
  '/',
  protect,
  isAdmin,
  blogUploadFields,
  validate(createBlogSchema),
  blogController.createBlog
);

// Regenerate preview token for a blog post (admin only)
router.post(
  '/:id/regenerate-preview-token',
  protect,
  isAdmin,
  blogController.regeneratePreviewToken
);

// Reorder gallery images of a blog post (admin only)
router.patch(
  '/:id/images/reorder',
  protect,
  isAdmin,
  validate(reorderBlogImagesSchema),
  blogController.reorderBlogImages
);

// Delete a single image from gallery (admin only)
router.delete('/:id/images/:imageId', protect, isAdmin, blogController.deleteBlogImage);

// Update existing blog post by ID (admin only) - Supports both PUT and PATCH
router.put(
  '/:id',
  protect,
  isAdmin,
  blogUploadFields,
  validate(updateBlogSchema),
  blogController.updateBlog
);

router.patch(
  '/:id',
  protect,
  isAdmin,
  blogUploadFields,
  validate(updateBlogSchema),
  blogController.updateBlog
);

// Delete blog post by ID (admin only)
router.delete('/:id', protect, isAdmin, blogController.deleteBlog);

// ==========================================
// 3. PUBLIC SLUG ROUTE (Defined last to avoid route collision)
// ==========================================

// Get single blog by slug (increments views, returns related products & related blogs)
router.get('/:slug', blogController.getBlogBySlug);

export default router;
