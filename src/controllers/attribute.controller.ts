import { Request, Response } from 'express';
import { AttributeService } from '../services/attribute.service';
import { catchAsync } from '../utils/catchAsync';

export const getAllAttributes = catchAsync(async (req: Request, res: Response) => {
  const attributes = await AttributeService.getAllAttributes();
  res.status(200).json({
    status: 'success',
    results: attributes.length,
    data: { attributes }
  });
});

export const createAttribute = catchAsync(async (req: Request, res: Response) => {
  const attribute = await AttributeService.createAttribute(req.body);
  res.status(201).json({
    status: 'success',
    data: { attribute }
  });
});

export const updateAttribute = catchAsync(async (req: Request, res: Response) => {
  const attribute = await AttributeService.updateAttribute(req.params.id as string, req.body);
  res.status(200).json({
    status: 'success',
    data: { attribute }
  });
});

export const addAttributeValue = catchAsync(async (req: Request, res: Response) => {
  const attribute = await AttributeService.addValue(req.params.id as string, req.body.value);
  res.status(200).json({
    status: 'success',
    data: { attribute }
  });
});

export const removeAttributeValue = catchAsync(async (req: Request, res: Response) => {
  const attribute = await AttributeService.removeValue(req.params.id as string, req.body.value);
  res.status(200).json({
    status: 'success',
    data: { attribute }
  });
});

export const deleteAttribute = catchAsync(async (req: Request, res: Response) => {
  await AttributeService.deleteAttribute(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null
  });
});
