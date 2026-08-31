import { Request, Response } from 'express';
import { BlogService } from '../services/blog.service';
import { catchAsync } from '../utils/catchAsync';
import { AuthenticatedRequest } from '../middlewares/auth';

/**
 * @desc    Create a new blog post
 * @route   POST /api/blogs
 * @access  Private/Admin
 */
export const createBlog = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const singleFile = req.file;

  const filesPayload = files || (singleFile ? { coverImage: [singleFile] } : undefined);
  const blog = await BlogService.createBlog(req.body, filesPayload);

  res.status(201).json({
    success: true,
    status: 'success',
    message: 'Blog post created successfully',
    data: { blog },
  });
});

/**
 * @desc    Get all published blogs (public, paginated, searchable, filterable)
 * @route   GET /api/blogs
 * @access  Public
 */
export const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getAllBlogs(req.query);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Blogs retrieved successfully',
    data: result,
  });
});

/**
 * @desc    Get Featured Story Blog for homepage
 * @route   GET /api/blogs/featured
 * @access  Public
 */
export const getFeaturedBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await BlogService.getFeaturedBlog();

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Featured blog retrieved successfully',
    data: { blog },
  });
});

/**
 * @desc    Get single blog by slug and rate-limited view increment
 * @route   GET /api/blogs/:slug
 * @access  Public
 */
export const getBlogBySlug = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.ip ||
    req.socket.remoteAddress ||
    '127.0.0.1';

  const result = await BlogService.getBlogBySlug(slug, clientIp);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Blog post retrieved successfully',
    data: result,
  });
});

/**
 * @desc    Get blog draft/scheduled preview by token
 * @route   GET /api/blogs/preview/:slug
 * @access  Public (Token-Gated)
 */
export const getBlogPreview = catchAsync(async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const token =
    (req.query.token as string) ||
    (req.headers['x-preview-token'] as string) ||
    '';

  const result = await BlogService.getBlogForPreview(slug, token);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Blog preview retrieved successfully',
    data: result,
  });
});

/**
 * @desc    Regenerate preview token for a blog
 * @route   POST /api/blogs/:id/regenerate-preview-token
 * @access  Private/Admin
 */
export const regeneratePreviewToken = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const blog = await BlogService.regeneratePreviewToken(id);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Preview token regenerated successfully',
    data: { blog },
  });
});

/**
 * @desc    Update a blog post
 * @route   PUT /api/blogs/:id
 * @access  Private/Admin
 */
export const updateBlog = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
  const singleFile = req.file;

  const filesPayload = files || (singleFile ? { coverImage: [singleFile] } : undefined);
  const blog = await BlogService.updateBlog(id, req.body, filesPayload);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Blog post updated successfully',
    data: { blog },
  });
});

/**
 * @desc    Delete a blog post
 * @route   DELETE /api/blogs/:id
 * @access  Private/Admin
 */
export const deleteBlog = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  await BlogService.deleteBlog(id);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Blog post deleted successfully',
    data: null,
  });
});

/**
 * @desc    Get all blogs for admin dashboard (all statuses, paginated)
 * @route   GET /api/blogs/admin/all
 * @access  Private/Admin
 */
export const getAdminBlogs = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await BlogService.getAdminBlogs(req.query);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Admin blogs retrieved successfully',
    data: result,
  });
});

/**
 * @desc    Delete a single image from blog gallery
 * @route   DELETE /api/blogs/:id/images/:imageId
 * @access  Private/Admin
 */
export const deleteBlogImage = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id, imageId } = req.params;
  const blog = await BlogService.deleteBlogImage(id as string, imageId as string);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Gallery image deleted successfully',
    data: { blog },
  });
});

/**
 * @desc    Reorder images in blog gallery
 * @route   PATCH /api/blogs/:id/images/reorder
 * @access  Private/Admin
 */
export const reorderBlogImages = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { imageIds } = req.body;
  const blog = await BlogService.reorderBlogImages(id as string, imageIds);

  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Gallery images reordered successfully',
    data: { blog },
  });
});
