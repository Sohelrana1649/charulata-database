import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const blogImageItemSchema = z.union([
  z.string().min(1, 'Image URL cannot be empty'),
  z.object({
    url: z.string().min(1, 'Image URL cannot be empty'),
    publicId: z.string().optional(),
    caption: z.string().optional(),
    order: z.number().optional().default(0),
  }),
]);

const blogImagesSchema = z
  .union([
    z.array(blogImageItemSchema).max(10, 'Maximum 10 images allowed in gallery'),
    z.string().transform((val) => {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return val ? [{ url: val }] : [];
      }
    }),
  ])
  .optional();

const relatedProductsSchema = z
  .union([
    z.array(z.string().regex(objectIdRegex, 'Invalid product ID format')).max(8, 'Maximum 8 related products allowed'),
    z.string().transform((val) => {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [val];
      } catch {
        return val
          .split(',')
          .map((id) => id.trim())
          .filter((id) => objectIdRegex.test(id));
      }
    }),
  ])
  .optional();

const booleanFieldSchema = z
  .union([
    z.boolean(),
    z.string().transform((val) => val === 'true' || val === '1'),
  ])
  .optional();

export const createBlogSchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title is required').trim(),
      titleBn: z.string().trim().optional(),
      slug: z.string().trim().optional(),
      excerpt: z.string().trim().optional(),
      content: z.string().min(1, 'Content is required'),
      contentBn: z.string().optional(),
      coverImage: z.string().optional(),
      images: blogImagesSchema,
      relatedProducts: relatedProductsSchema,
      focusKeyword: z.string().max(100, 'Focus keyword must be under 100 characters').trim().optional(),
      isFeatured: booleanFieldSchema,
      scheduledAt: z.string().or(z.date()).optional(),
      author: z.string().trim().optional(),
      category: z.string().trim().optional(),
      tags: z
        .union([
          z.array(z.string()),
          z.string().transform((val) => {
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed) ? parsed : [val];
            } catch {
              return val.split(',').map((t) => t.trim()).filter(Boolean);
            }
          }),
        ])
        .optional(),
      metaTitle: z.string().trim().optional(),
      metaDescription: z.string().trim().optional(),
      status: z.enum(['draft', 'published', 'scheduled']).optional().default('draft'),
    })
    .superRefine((data, ctx) => {
      // 1. Validation for Published status
      if (data.status === 'published') {
        if (!data.title || !data.title.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Title is required to publish a blog post',
            path: ['title'],
          });
        }
        if (!data.content || !data.content.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Content is required to publish a blog post',
            path: ['content'],
          });
        }
        if (!data.metaTitle || !data.metaTitle.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'metaTitle is required for SEO before publishing',
            path: ['metaTitle'],
          });
        }
        if (!data.metaDescription || !data.metaDescription.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'metaDescription is required for SEO before publishing',
            path: ['metaDescription'],
          });
        }
      }

      // 2. Validation for Scheduled status
      if (data.status === 'scheduled') {
        if (!data.scheduledAt) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'scheduledAt date is required for scheduled blogs',
            path: ['scheduledAt'],
          });
        } else {
          const scheduleDate = new Date(data.scheduledAt);
          if (isNaN(scheduleDate.getTime())) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Invalid scheduledAt date format',
              path: ['scheduledAt'],
            });
          } else if (scheduleDate.getTime() <= Date.now()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'scheduledAt must be a future date and time',
              path: ['scheduledAt'],
            });
          }
        }
      }
    }),
});

export const updateBlogSchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title cannot be empty').trim().optional(),
      titleBn: z.string().trim().optional(),
      slug: z.string().trim().optional(),
      excerpt: z.string().trim().optional(),
      content: z.string().min(1, 'Content cannot be empty').optional(),
      contentBn: z.string().optional(),
      coverImage: z.string().optional(),
      images: blogImagesSchema,
      relatedProducts: relatedProductsSchema,
      focusKeyword: z.string().max(100, 'Focus keyword must be under 100 characters').trim().optional(),
      isFeatured: booleanFieldSchema,
      scheduledAt: z.string().or(z.date()).optional(),
      author: z.string().trim().optional(),
      category: z.string().trim().optional(),
      tags: z
        .union([
          z.array(z.string()),
          z.string().transform((val) => {
            try {
              const parsed = JSON.parse(val);
              return Array.isArray(parsed) ? parsed : [val];
            } catch {
              return val.split(',').map((t) => t.trim()).filter(Boolean);
            }
          }),
        ])
        .optional(),
      metaTitle: z.string().trim().optional(),
      metaDescription: z.string().trim().optional(),
      status: z.enum(['draft', 'published', 'scheduled']).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.status === 'scheduled') {
        if (data.scheduledAt) {
          const scheduleDate = new Date(data.scheduledAt);
          if (isNaN(scheduleDate.getTime())) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Invalid scheduledAt date format',
              path: ['scheduledAt'],
            });
          } else if (scheduleDate.getTime() <= Date.now()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'scheduledAt must be a future date and time',
              path: ['scheduledAt'],
            });
          }
        }
      }
    }),
});

export const reorderBlogImagesSchema = z.object({
  body: z.object({
    imageIds: z.array(z.string()).min(1, 'imageIds must be a non-empty array of image IDs'),
  }),
});
