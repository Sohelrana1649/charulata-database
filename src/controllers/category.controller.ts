import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';
import { catchAsync } from '../utils/catchAsync';

export const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const categories = await CategoryService.getAllCategories(req.query);
  res.status(200).json({
    status: 'success',
    results: categories.length,
    data: { categories }
  });
});

export const getCategoryBySlug = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.getCategoryBySlug(req.params.slug as string);
  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.createCategory(req.body);
  res.status(201).json({
    status: 'success',
    data: { category }
  });
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await CategoryService.updateCategory(req.params.id as string, req.body);
  res.status(200).json({
    status: 'success',
    data: { category }
  });
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await CategoryService.deleteCategory(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const getCategoryAttributes = catchAsync(async (req: Request, res: Response) => {
  const attributes = await CategoryService.getCategoryAttributes(req.params.id as string);
  res.status(200).json({
    status: 'success',
    data: { attributes }
  });
});
