import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be non-negative'),
    salePrice: z.number().min(0, 'Sale price must be non-negative').optional(),
    productImages: z.array(z.string().min(1)).min(1, 'At least one product image is required'),
    videoUrl: z.string().optional(),
    attributes: z.array(z.object({
      name: z.string(),
      options: z.array(z.string())
    })).optional(),
    variants: z.array(z.object({
      color: z.string().optional(),
      size: z.string().optional(),
      price: z.number().min(0).optional(),
      stockQuantity: z.number().min(0, 'Stock quantity must be non-negative'),
      sku: z.string().optional(),
      image: z.string().optional(),
      attributes: z.record(z.string(), z.string()).optional()
    })).optional(),
    variantOverrides: z.array(z.object({
      match: z.record(z.string(), z.string()),
      price: z.number().min(0).optional(),
      stockQuantity: z.number().min(0).optional(),
      sku: z.string().optional(),
      image: z.string().optional()
    })).optional(),
    sizes: z.array(z.string()).optional(),
    colors: z.array(z.string()).optional(),
    stockQuantity: z.number().min(0, 'Stock quantity must be non-negative'),
    sku: z.string().min(3, 'SKU must be at least 3 characters'),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    tags: z.array(z.string()).optional(),
    bestSelling: z.boolean().optional(),
    newArrival: z.boolean().optional(),
    flashSale: z.boolean().optional(),
    discountStartDate: z.string().optional(),
    discountEndDate: z.string().optional()
  })
});

export const updateProductSchema = createProductSchema.partial();

