import crypto from 'crypto';
import { Types } from 'mongoose';
import { Blog, IBlog, IBlogImage } from '../models/blog.model';
import { slugify } from '../utils/slugify';
import { AppError } from '../utils/appError';
import {
  uploadBufferToCloudinary,
  uploadBase64ToCloudinary,
  uploadBufferToCloudinaryDetails,
  uploadBase64ToCloudinaryDetails,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
} from '../utils/cloudinary';
import { revalidateFrontend } from '../utils/revalidate';
import { viewRateLimiter } from '../utils/viewLimiter';

export class BlogService {
  /**
   * Generates a 48-character cryptographically secure hex preview token
   */
  static generatePreviewToken(): string {
    return crypto.randomBytes(24).toString('hex');
  }

  /**
   * Helper that builds the public visibility filter:
   * (status === 'published' OR (status === 'scheduled' AND scheduledAt <= now))
   */
  private static getPublicFilter(): any {
    const now = new Date();
    return {
      $or: [
        { status: 'published' },
        { status: 'scheduled', scheduledAt: { $lte: now } },
      ],
    };
  }

  /**
   * Generates a collision-free unique slug for a blog post
   */
  static async generateUniqueSlug(title: string, currentBlogId?: string): Promise<string> {
    let baseSlug = slugify(title);

    // Fallback if slugify produces empty string (e.g. purely special chars or non-ASCII)
    if (!baseSlug || baseSlug.length < 2) {
      baseSlug = `blog-${Date.now().toString(36)}`;
    }

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query: any = { slug };
      if (currentBlogId) {
        query._id = { $ne: currentBlogId };
      }

      const existing = await Blog.findOne(query).select('_id').lean();
      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  /**
   * Parse tags from string (JSON or CSV) or array
   */
  private static normalizeTags(tags: any): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags.map((t) => String(t).trim()).filter(Boolean);
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        if (Array.isArray(parsed)) {
          return parsed.map((t) => String(t).trim()).filter(Boolean);
        }
      } catch {
        // Not JSON, split by comma
      }
      return tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    return [];
  }

  /**
   * Parse relatedProducts from array, JSON string, or CSV
   */
  private static normalizeRelatedProducts(products: any): Types.ObjectId[] {
    if (!products) return [];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    let stringIds: string[] = [];
    if (Array.isArray(products)) {
      stringIds = products
        .map((p) => (typeof p === 'object' && p?._id ? p._id.toString() : String(p).trim()))
        .filter((id) => objectIdRegex.test(id));
    } else if (typeof products === 'string') {
      try {
        const parsed = JSON.parse(products);
        if (Array.isArray(parsed)) {
          stringIds = parsed
            .map((p) => (typeof p === 'object' && p?._id ? p._id.toString() : String(p).trim()))
            .filter((id) => objectIdRegex.test(id));
        }
      } catch {
        stringIds = products
          .split(',')
          .map((id) => id.trim())
          .filter((id) => objectIdRegex.test(id));
      }
    }

    return stringIds.slice(0, 8).map((id) => new Types.ObjectId(id));
  }

  /**
   * Process and normalize images array (handles base64, URLs, and existing objects)
   */
  private static async processImagesInput(
    imagesInput: any,
    uploadedImageFiles?: Express.Multer.File[]
  ): Promise<IBlogImage[]> {
    let processedImages: IBlogImage[] = [];

    // 1. Process files from multer upload (if any)
    if (uploadedImageFiles && uploadedImageFiles.length > 0) {
      for (let i = 0; i < uploadedImageFiles.length; i++) {
        const file = uploadedImageFiles[i];
        const { url, publicId } = await uploadBufferToCloudinaryDetails(file.buffer, 'charulata_blogs');
        processedImages.push({
          url,
          publicId,
          caption: file.originalname ? file.originalname.replace(/\.[^/.]+$/, '') : '',
          order: i,
        });
      }
    }

    // 2. Process images passed in body
    if (imagesInput) {
      let rawList: any[] = [];
      if (Array.isArray(imagesInput)) {
        rawList = imagesInput;
      } else if (typeof imagesInput === 'string') {
        try {
          const parsed = JSON.parse(imagesInput);
          rawList = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          rawList = [{ url: imagesInput }];
        }
      }

      for (let i = 0; i < rawList.length; i++) {
        const item = rawList[i];
        if (!item) continue;

        let imgUrl = typeof item === 'string' ? item : item.url;
        let publicId = typeof item === 'object' ? item.publicId : '';
        const caption = typeof item === 'object' ? item.caption : '';
        const order = typeof item === 'object' && item.order !== undefined ? item.order : processedImages.length + i;

        if (imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('data:image')) {
          const uploaded = await uploadBase64ToCloudinaryDetails(imgUrl, 'charulata_blogs');
          imgUrl = uploaded.url;
          publicId = uploaded.publicId;
        } else if (!publicId && imgUrl) {
          publicId = extractPublicIdFromUrl(imgUrl) || '';
        }

        if (imgUrl) {
          processedImages.push({
            url: imgUrl,
            publicId,
            caption,
            order,
          });
        }
      }
    }

    return processedImages.slice(0, 10);
  }

  /**
   * Create a new Blog post (Admin)
   */
  static async createBlog(
    data: any,
    files?: { coverImage?: Express.Multer.File[]; images?: Express.Multer.File[] } | Buffer
  ): Promise<IBlog> {
    const blogData = { ...data };

    let coverFile: Express.Multer.File | undefined;
    let imageFiles: Express.Multer.File[] | undefined;

    if (Buffer.isBuffer(files)) {
      blogData.coverImage = await uploadBufferToCloudinary(files, 'charulata_blogs');
    } else if (files && typeof files === 'object') {
      coverFile = files.coverImage?.[0];
      imageFiles = files.images;
    }

    // Handle Cover Image Upload
    if (coverFile) {
      blogData.coverImage = await uploadBufferToCloudinary(coverFile.buffer, 'charulata_blogs');
    } else if (
      blogData.coverImage &&
      typeof blogData.coverImage === 'string' &&
      blogData.coverImage.startsWith('data:image')
    ) {
      blogData.coverImage = await uploadBase64ToCloudinary(blogData.coverImage, 'charulata_blogs');
    }

    // Handle Multiple Images Gallery
    blogData.images = await this.processImagesInput(blogData.images, imageFiles);

    // Normalize tags
    if (blogData.tags !== undefined) {
      blogData.tags = this.normalizeTags(blogData.tags);
    }

    // Normalize relatedProducts
    if (blogData.relatedProducts !== undefined) {
      blogData.relatedProducts = this.normalizeRelatedProducts(blogData.relatedProducts);
    }

    // Normalize isFeatured boolean
    if (blogData.isFeatured !== undefined) {
      blogData.isFeatured = String(blogData.isFeatured) === 'true';
    }

    // Automatically generate secure previewToken if not provided
    if (!blogData.previewToken) {
      blogData.previewToken = this.generatePreviewToken();
    }

    // Auto-generate unique slug
    blogData.slug = await this.generateUniqueSlug(blogData.slug || blogData.title);

    // Validate requirements before publishing
    if (blogData.status === 'published') {
      if (!blogData.title || !blogData.title.trim()) {
        throw new AppError('Blog title is required to publish', 400);
      }
      if (!blogData.content || !blogData.content.trim()) {
        throw new AppError('Blog content is required to publish', 400);
      }
      if (!blogData.metaTitle || !blogData.metaTitle.trim()) {
        throw new AppError('metaTitle is required for SEO before publishing', 400);
      }
      if (!blogData.metaDescription || !blogData.metaDescription.trim()) {
        throw new AppError('metaDescription is required for SEO before publishing', 400);
      }
    }

    // Validate scheduledAt if status is scheduled
    if (blogData.status === 'scheduled') {
      if (!blogData.scheduledAt) {
        throw new AppError('scheduledAt date is required for scheduled blogs', 400);
      }
      const scheduleDate = new Date(blogData.scheduledAt);
      if (isNaN(scheduleDate.getTime()) || scheduleDate.getTime() <= Date.now()) {
        throw new AppError('scheduledAt must be a valid future date', 400);
      }
      blogData.scheduledAt = scheduleDate;
    }

    // If isFeatured=true, ensure atomic exclusivity (unset any other featured blog)
    if (blogData.isFeatured) {
      await Blog.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
    }

    const createdBlog = await Blog.create(blogData);

    // On-demand ISR Revalidation trigger if blog is published
    if (createdBlog.status === 'published') {
      const pathsToRevalidate = ['/blog', `/blog/${createdBlog.slug}`];
      if (createdBlog.isFeatured) {
        pathsToRevalidate.push('/');
      }
      revalidateFrontend(pathsToRevalidate).catch((e) =>
        console.error('[BLOG CREATE REVALIDATE ERROR]', e)
      );
    }

    return createdBlog;
  }

  /**
   * Get all public blogs (Published or past scheduled date, paginated, searchable, filterable)
   */
  static async getAllBlogs(query: any) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {
      ...this.getPublicFilter(),
    };

    // Search filter (title, titleBn, tags, excerpt, content, focusKeyword)
    const searchTerm = (query.search || query.q || '').trim();
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$and = [
        this.getPublicFilter(),
        {
          $or: [
            { title: searchRegex },
            { titleBn: searchRegex },
            { tags: searchRegex },
            { excerpt: searchRegex },
            { category: searchRegex },
            { focusKeyword: searchRegex },
          ],
        },
      ];
      delete filter.$or;
    }

    // Category filter
    if (query.category && query.category.trim()) {
      filter.category = new RegExp(`^${query.category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    // Tag filter
    if (query.tag && query.tag.trim()) {
      filter.tags = new RegExp(`^${query.tag.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    // Sorting
    let sortOption: any = { createdAt: -1 };
    if (query.sort) {
      if (query.sort === 'views' || query.sort === '-views') {
        sortOption = { views: query.sort.startsWith('-') ? -1 : 1 };
      } else if (query.sort === 'oldest' || query.sort === 'createdAt') {
        sortOption = { createdAt: 1 };
      } else if (query.sort === 'newest' || query.sort === '-createdAt') {
        sortOption = { createdAt: -1 };
      } else if (query.sort === 'title' || query.sort === '-title') {
        sortOption = { title: query.sort.startsWith('-') ? -1 : 1 };
      }
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .select(
          'title titleBn slug excerpt coverImage images relatedProducts focusKeyword isFeatured scheduledAt author category tags metaTitle metaDescription status views createdAt updatedAt'
        )
        .populate({
          path: 'relatedProducts',
          select: 'title slug price salePrice productImages badge ratings stockQuantity sku',
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    return {
      blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get single blog by slug, rate-limited views increment (1 view per visitor/IP per 30 mins),
   * populates related products & related blogs (Public)
   */
  static async getBlogBySlug(slug: string, clientIp?: string) {
    if (!slug) {
      throw new AppError('Blog slug is required', 400);
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    const slugQuery = isObjectId ? { $or: [{ slug }, { _id: new Types.ObjectId(slug) }] } : { slug };

    const query: any = {
      $and: [slugQuery, this.getPublicFilter()],
    };

    const blog = await Blog.findOne(query).populate({
      path: 'relatedProducts',
      select: 'title slug price salePrice productImages badge ratings stockQuantity sku',
    });

    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    // Rate-limited view increment logic (30 minutes sliding window per IP)
    // NOTE: This same rate-limit key pattern (e.g. `product-view:{productId}:{ip}`)
    // can later be reused for product view counts or other entity analytics if needed.
    if (clientIp) {
      try {
        const isNewView = viewRateLimiter.shouldCountView('blog', blog._id.toString(), clientIp, 30 * 60 * 1000);
        if (isNewView) {
          Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } }).catch((err) =>
            console.error('[BLOG VIEW INCREMENT ERROR]', err)
          );
          blog.views = (blog.views || 0) + 1;
        }
      } catch (rateLimitErr) {
        console.error('[BLOG VIEW RATE LIMIT CHECK ERROR]', rateLimitErr);
      }
    }

    // Retrieve related blogs by category (excluding current blog)
    let relatedBlogs: any[] = [];
    if (blog.category) {
      const catQuery: any = {
        category: blog.category,
        _id: { $ne: blog._id },
        ...this.getPublicFilter(),
      };
      relatedBlogs = await Blog.find(catQuery)
        .select('title titleBn slug excerpt coverImage category isFeatured createdAt views')
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();
    }

    // Fallback: If not enough related blogs by category, fetch recent published posts
    if (relatedBlogs.length < 3) {
      const excludeIds = [blog._id, ...relatedBlogs.map((b) => b._id)];
      const fallbackQuery: any = {
        _id: { $nin: excludeIds },
        ...this.getPublicFilter(),
      };
      const additionalBlogs = await Blog.find(fallbackQuery)
        .select('title titleBn slug excerpt coverImage category isFeatured createdAt views')
        .sort({ createdAt: -1 })
        .limit(4 - relatedBlogs.length)
        .lean();

      relatedBlogs = [...relatedBlogs, ...additionalBlogs];
    }

    return {
      blog,
      relatedBlogs,
    };
  }

  /**
   * Secure Preview Access: Fetch any blog (draft, scheduled, published) by slug and valid previewToken
   */
  static async getBlogForPreview(slug: string, token: string) {
    if (!slug) {
      throw new AppError('Blog slug is required for preview', 400);
    }
    if (!token || typeof token !== 'string' || !token.trim()) {
      throw new AppError('A valid preview token is required to preview this content', 401);
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isObjectId ? { $or: [{ slug }, { _id: new Types.ObjectId(slug) }] } : { slug };

    const blog = await Blog.findOne(query).populate({
      path: 'relatedProducts',
      select: 'title slug price salePrice productImages badge ratings stockQuantity sku',
    });

    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    // Validate preview token securely
    if (!blog.previewToken || blog.previewToken !== token.trim()) {
      throw new AppError('Invalid or expired preview token', 403);
    }

    // Retrieve related blogs for preview rendering
    let relatedBlogs: any[] = [];
    if (blog.category) {
      relatedBlogs = await Blog.find({
        category: blog.category,
        _id: { $ne: blog._id },
      })
        .select('title titleBn slug excerpt coverImage category isFeatured createdAt views')
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();
    }

    return {
      blog,
      relatedBlogs,
    };
  }

  /**
   * Regenerate preview token for a blog (Admin) - invalidates previous preview links
   */
  static async regeneratePreviewToken(blogId: string): Promise<IBlog> {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    blog.previewToken = this.generatePreviewToken();
    await blog.save();

    return blog;
  }

  /**
   * Get single Featured Story Blog for homepage (Public)
   */
  static async getFeaturedBlog(): Promise<IBlog | null> {
    const query: any = {
      isFeatured: true,
      ...this.getPublicFilter(),
    };

    const featuredBlog = await Blog.findOne(query)
      .populate({
        path: 'relatedProducts',
        select: 'title slug price salePrice productImages badge ratings stockQuantity sku',
      })
      .sort({ createdAt: -1 });

    return featuredBlog;
  }

  /**
   * Update blog post (Admin)
   */
  static async updateBlog(
    id: string,
    data: any,
    files?: { coverImage?: Express.Multer.File[]; images?: Express.Multer.File[] } | Buffer
  ): Promise<IBlog> {
    const existing = await Blog.findById(id);
    if (!existing) {
      throw new AppError('Blog post not found', 404);
    }

    const updateData = { ...data };

    let coverFile: Express.Multer.File | undefined;
    let imageFiles: Express.Multer.File[] | undefined;

    if (Buffer.isBuffer(files)) {
      updateData.coverImage = await uploadBufferToCloudinary(files, 'charulata_blogs');
    } else if (files && typeof files === 'object') {
      coverFile = files.coverImage?.[0];
      imageFiles = files.images;
    }

    // Handle Cover Image Upload
    if (coverFile) {
      updateData.coverImage = await uploadBufferToCloudinary(coverFile.buffer, 'charulata_blogs');
    } else if (
      updateData.coverImage &&
      typeof updateData.coverImage === 'string' &&
      updateData.coverImage.startsWith('data:image')
    ) {
      updateData.coverImage = await uploadBase64ToCloudinary(updateData.coverImage, 'charulata_blogs');
    }

    // Handle Gallery Images
    if ((imageFiles && imageFiles.length > 0) || updateData.images !== undefined) {
      const newImages = await this.processImagesInput(updateData.images, imageFiles);
      if (imageFiles && imageFiles.length > 0 && updateData.images === undefined) {
        updateData.images = [...(existing.images || []), ...newImages].slice(0, 10);
      } else {
        updateData.images = newImages;
      }
    }

    // Normalize tags
    if (updateData.tags !== undefined) {
      updateData.tags = this.normalizeTags(updateData.tags);
    }

    // Normalize relatedProducts
    if (updateData.relatedProducts !== undefined) {
      updateData.relatedProducts = this.normalizeRelatedProducts(updateData.relatedProducts);
    }

    // Normalize isFeatured
    if (updateData.isFeatured !== undefined) {
      updateData.isFeatured = String(updateData.isFeatured) === 'true';
    }

    // Ensure previewToken exists
    if (!existing.previewToken && !updateData.previewToken) {
      updateData.previewToken = this.generatePreviewToken();
    }

    // Auto-update slug if title or slug is provided and changed
    if (updateData.title && updateData.title !== existing.title) {
      updateData.slug = await this.generateUniqueSlug(updateData.slug || updateData.title, id);
    } else if (updateData.slug && updateData.slug !== existing.slug) {
      updateData.slug = await this.generateUniqueSlug(updateData.slug, id);
    }

    // Check published validation if transitioning or staying in published status
    const targetStatus = updateData.status !== undefined ? updateData.status : existing.status;
    if (targetStatus === 'published') {
      const finalTitle = updateData.title !== undefined ? updateData.title : existing.title;
      const finalContent = updateData.content !== undefined ? updateData.content : existing.content;
      const finalMetaTitle = updateData.metaTitle !== undefined ? updateData.metaTitle : existing.metaTitle;
      const finalMetaDescription = updateData.metaDescription !== undefined ? updateData.metaDescription : existing.metaDescription;

      if (!finalTitle || !finalTitle.trim()) {
        throw new AppError('Blog title is required to publish', 400);
      }
      if (!finalContent || !finalContent.trim()) {
        throw new AppError('Blog content is required to publish', 400);
      }
      if (!finalMetaTitle || !finalMetaTitle.trim()) {
        throw new AppError('metaTitle is required for SEO before publishing', 400);
      }
      if (!finalMetaDescription || !finalMetaDescription.trim()) {
        throw new AppError('metaDescription is required for SEO before publishing', 400);
      }
    }

    // Validate scheduledAt if status is scheduled
    if (targetStatus === 'scheduled') {
      const finalScheduledAt = updateData.scheduledAt !== undefined ? updateData.scheduledAt : existing.scheduledAt;
      if (!finalScheduledAt) {
        throw new AppError('scheduledAt date is required for scheduled blogs', 400);
      }
      const scheduleDate = new Date(finalScheduledAt);
      if (isNaN(scheduleDate.getTime()) || scheduleDate.getTime() <= Date.now()) {
        throw new AppError('scheduledAt must be a valid future date', 400);
      }
      updateData.scheduledAt = scheduleDate;
    }

    // If isFeatured=true, unset any other featured blog
    if (updateData.isFeatured) {
      await Blog.updateMany({ isFeatured: true, _id: { $ne: id } }, { $set: { isFeatured: false } });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    }).populate({
      path: 'relatedProducts',
      select: 'title slug price salePrice productImages badge ratings stockQuantity sku',
    });

    if (!updatedBlog) {
      throw new AppError('Blog post not found', 404);
    }

    // On-demand ISR Revalidation trigger if blog is or was published
    if (updatedBlog.status === 'published' || existing.status === 'published') {
      const pathsToRevalidate = ['/blog', `/blog/${updatedBlog.slug}`];
      if (existing.slug && existing.slug !== updatedBlog.slug) {
        pathsToRevalidate.push(`/blog/${existing.slug}`);
      }
      if (updatedBlog.isFeatured || existing.isFeatured) {
        pathsToRevalidate.push('/');
      }
      revalidateFrontend(pathsToRevalidate).catch((e) =>
        console.error('[BLOG UPDATE REVALIDATE ERROR]', e)
      );
    }

    return updatedBlog;
  }

  /**
   * Delete a single image from the blog gallery and destroy it in Cloudinary
   */
  static async deleteBlogImage(blogId: string, imageIdOrPublicId: string): Promise<IBlog> {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    const imageIndex = blog.images.findIndex(
      (img) =>
        img._id?.toString() === imageIdOrPublicId ||
        img.publicId === imageIdOrPublicId ||
        img.url === imageIdOrPublicId
    );

    if (imageIndex === -1) {
      throw new AppError('Image not found in this blog gallery', 404);
    }

    const targetImage = blog.images[imageIndex];
    const publicIdToDelete = targetImage.publicId || extractPublicIdFromUrl(targetImage.url);

    if (publicIdToDelete) {
      await deleteFromCloudinary(publicIdToDelete);
    }

    blog.images.splice(imageIndex, 1);
    await blog.save();

    // Revalidate if published
    if (blog.status === 'published') {
      const paths = ['/blog', `/blog/${blog.slug}`];
      if (blog.isFeatured) paths.push('/');
      revalidateFrontend(paths).catch((e) => console.error(e));
    }

    return blog;
  }

  /**
   * Reorder gallery images by array of image IDs
   */
  static async reorderBlogImages(blogId: string, orderedImageIds: string[]): Promise<IBlog> {
    if (!orderedImageIds || !Array.isArray(orderedImageIds)) {
      throw new AppError('orderedImageIds must be an array of image IDs', 400);
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    // Update order based on position in orderedImageIds
    blog.images.forEach((img) => {
      const idx = orderedImageIds.indexOf(img._id?.toString() || '');
      if (idx !== -1) {
        img.order = idx;
      }
    });

    // Sort images by order ascending
    blog.images.sort((a, b) => (a.order || 0) - (b.order || 0));
    await blog.save();

    // Revalidate if published
    if (blog.status === 'published') {
      const paths = ['/blog', `/blog/${blog.slug}`];
      if (blog.isFeatured) paths.push('/');
      revalidateFrontend(paths).catch((e) => console.error(e));
    }

    return blog;
  }

  /**
   * Delete blog post (Admin)
   */
  static async deleteBlog(id: string): Promise<IBlog> {
    const blog = await Blog.findById(id);
    if (!blog) {
      throw new AppError('Blog post not found', 404);
    }

    // Delete gallery images from Cloudinary
    if (blog.images && blog.images.length > 0) {
      for (const img of blog.images) {
        const pubId = img.publicId || extractPublicIdFromUrl(img.url);
        if (pubId) {
          deleteFromCloudinary(pubId).catch((err) =>
            console.error('[BLOG DELETE IMAGE CLEANUP ERROR]', err)
          );
        }
      }
    }

    // Delete cover image from Cloudinary if possible
    if (blog.coverImage) {
      const coverPubId = extractPublicIdFromUrl(blog.coverImage);
      if (coverPubId) {
        deleteFromCloudinary(coverPubId).catch((err) =>
          console.error('[BLOG DELETE COVER CLEANUP ERROR]', err)
        );
      }
    }

    const deletedBlog = await Blog.findByIdAndDelete(id);

    // On-demand ISR Revalidation trigger if deleted blog was published
    if (blog.status === 'published') {
      const pathsToRevalidate = ['/blog', `/blog/${blog.slug}`];
      if (blog.isFeatured) {
        pathsToRevalidate.push('/');
      }
      revalidateFrontend(pathsToRevalidate).catch((e) =>
        console.error('[BLOG DELETE REVALIDATE ERROR]', e)
      );
    }

    return deletedBlog!;
  }

  /**
   * Get all blogs for Admin (Supports drafts, published, scheduled, filtering, pagination)
   */
  static async getAdminBlogs(query: any) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Status filter (e.g. 'draft', 'published', 'scheduled', or all if not set)
    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    // isFeatured filter
    if (query.isFeatured !== undefined) {
      filter.isFeatured = String(query.isFeatured) === 'true';
    }

    // Search filter
    const searchTerm = (query.search || query.q || '').trim();
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: searchRegex },
        { titleBn: searchRegex },
        { tags: searchRegex },
        { excerpt: searchRegex },
        { category: searchRegex },
        { focusKeyword: searchRegex },
      ];
    }

    // Category filter
    if (query.category && query.category.trim()) {
      filter.category = new RegExp(`^${query.category.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    // Tag filter
    if (query.tag && query.tag.trim()) {
      filter.tags = new RegExp(`^${query.tag.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate({
          path: 'relatedProducts',
          select: 'title slug price salePrice productImages badge ratings stockQuantity sku',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
    ]);

    return {
      blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }
}
