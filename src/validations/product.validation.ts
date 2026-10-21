import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').optional(),
    title_en: z.string().min(2).optional(),
    title_bn: z.string().optional(),
    description: z.string().min(5, 'Description must be at least 5 characters').optional(),
    description_en: z.string().optional(),
    description_bn: z.string().optional(),
    metaTitle: z.string().max(100, 'Meta title cannot exceed 100 characters').optional(),
    metaTitle_en: z.string().max(100, 'Meta title cannot exceed 100 characters').optional(),
    metaTitle_bn: z.string().max(100, 'Meta title cannot exceed 100 characters').optional(),
    metaDescription: z.string().max(200, 'Meta description cannot exceed 200 characters').optional(),
    metaDescription_en: z.string().max(200, 'Meta description cannot exceed 200 characters').optional(),
    metaDescription_bn: z.string().max(200, 'Meta description cannot exceed 200 characters').optional(),
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
      salePrice: z.number().min(0).optional(),
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
    sku: z.string().min(2, 'SKU must be at least 2 characters'),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    parentCategory: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID').optional().nullable(),
    tags: z.array(z.string()).optional(),
    bestSelling: z.boolean().optional(),
    newArrival: z.boolean().optional(),
    flashSale: z.boolean().optional(),
    discountStartDate: z.string().optional(),
    discountEndDate: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional()
  }).refine(data => data.title || data.title_en, {
    message: 'Product title or title_en is required',
    path: ['title']
  }).refine(data => data.description || data.description_en, {
    message: 'Product description or description_en is required',
    path: ['description']
  })
});

export const updateProductSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    title_en: z.string().min(2).optional(),
    title_bn: z.string().optional(),
    description: z.string().min(5).optional(),
    description_en: z.string().optional(),
    description_bn: z.string().optional(),
    metaTitle: z.string().max(100).optional(),
    metaTitle_en: z.string().max(100).optional(),
    metaTitle_bn: z.string().max(100).optional(),
    metaDescription: z.string().max(200).optional(),
    metaDescription_en: z.string().max(200).optional(),
    metaDescription_bn: z.string().max(200).optional(),
    price: z.number().min(0).optional(),
    salePrice: z.number().min(0).optional(),
    productImages: z.array(z.string().min(1)).optional(),
    videoUrl: z.string().optional(),
    attributes: z.array(z.object({
      name: z.string(),
      options: z.array(z.string())
    })).optional(),
    variants: z.array(z.object({
      color: z.string().optional(),
      size: z.string().optional(),
      price: z.number().min(0).optional(),
      salePrice: z.number().min(0).optional(),
      stockQuantity: z.number().min(0).optional(),
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
    stockQuantity: z.number().min(0).optional(),
    sku: z.string().min(2).optional(),
    category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID').optional(),
    parentCategory: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid parent category ID').optional().nullable(),
    tags: z.array(z.string()).optional(),
    bestSelling: z.boolean().optional(),
    newArrival: z.boolean().optional(),
    flashSale: z.boolean().optional(),
    discountStartDate: z.string().optional(),
    discountEndDate: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional()
  })
});

