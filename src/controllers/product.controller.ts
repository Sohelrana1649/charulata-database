import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { catchAsync } from '../utils/catchAsync';
import { AuthenticatedRequest } from '../middlewares/auth';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.createProduct(req.body);
  res.status(201).json({
    status: 'success',
    data: { product }
  });
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const product = await ProductService.updateProduct(req.params.id as string, req.body);
  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await ProductService.deleteProduct(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const bulkUpdateProducts = catchAsync(async (req: Request, res: Response) => {
  const { productIds, ...updateData } = req.body;
  const result = await ProductService.bulkUpdateProducts(productIds, updateData);
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const bulkDeleteProducts = catchAsync(async (req: Request, res: Response) => {
  const { productIds } = req.body;
  const result = await ProductService.bulkDeleteProducts(productIds);
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const getProductBySlug = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?._id?.toString();
  const product = await ProductService.getProductBySlug(req.params.slug as string, userId);
  res.status(200).json({
    status: 'success',
    data: { product }
  });
});

export const getProducts = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductService.getProducts(req.query);
  res.status(200).json({
    status: 'success',
    ...result
  });
});

export const getSearchSuggestions = catchAsync(async (req: Request, res: Response) => {
  const suggestions = await ProductService.getSearchSuggestions(req.query.q as string);
  res.status(200).json({
    status: 'success',
    data: { suggestions }
  });
});
