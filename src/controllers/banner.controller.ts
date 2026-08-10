import { Request, Response } from 'express';
import { BannerService } from '../services/banner.service';
import { catchAsync } from '../utils/catchAsync';

export const createBanner = catchAsync(async (req: Request, res: Response) => {
  const banner = await BannerService.createBanner(req.body);
  res.status(201).json({
    status: 'success',
    data: { banner }
  });
});

export const getActiveBanners = catchAsync(async (req: Request, res: Response) => {
  const banners = await BannerService.getActiveBanners();
  res.status(200).json({
    status: 'success',
    results: banners.length,
    data: { banners }
  });
});

export const getAllBanners = catchAsync(async (req: Request, res: Response) => {
  const banners = await BannerService.getAllBanners();
  res.status(200).json({
    status: 'success',
    results: banners.length,
    data: { banners }
  });
});

export const updateBanner = catchAsync(async (req: Request, res: Response) => {
  const banner = await BannerService.updateBanner(req.params.id as string, req.body);
  res.status(200).json({
    status: 'success',
    data: { banner }
  });
});

export const deleteBanner = catchAsync(async (req: Request, res: Response) => {
  await BannerService.deleteBanner(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null
  });
});
