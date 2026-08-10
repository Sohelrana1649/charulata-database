import { Request, Response } from 'express';
import { DeliveryService } from '../services/delivery.service';
import { catchAsync } from '../utils/catchAsync';

export const createOrUpdateZone = catchAsync(async (req: Request, res: Response) => {
  const zone = await DeliveryService.createOrUpdateZone(req.body);
  res.status(200).json({
    status: 'success',
    data: { zone }
  });
});

export const getAllZones = catchAsync(async (req: Request, res: Response) => {
  const zones = await DeliveryService.getAllZones();
  res.status(200).json({
    status: 'success',
    results: zones.length,
    data: { zones }
  });
});

export const deleteZone = catchAsync(async (req: Request, res: Response) => {
  await DeliveryService.deleteZone(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const getShippingCharge = catchAsync(async (req: Request, res: Response) => {
  const { district } = req.query;
  if (!district) {
    res.status(400).json({
      status: 'fail',
      message: 'District query parameter is required'
    });
    return;
  }
  const data = await DeliveryService.getChargeForDistrict(district as string);
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getDistricts = catchAsync(async (req: Request, res: Response) => {
  const districts = await DeliveryService.getActiveDistricts();
  res.status(200).json({
    status: 'success',
    data: districts
  });
});
