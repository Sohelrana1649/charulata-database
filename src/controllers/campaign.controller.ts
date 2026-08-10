import { Request, Response } from 'express';
import { CampaignService } from '../services/campaign.service';
import { catchAsync } from '../utils/catchAsync';

export const getActiveCampaign = catchAsync(async (req: Request, res: Response) => {
  const campaign = await CampaignService.getActiveCampaign();
  res.status(200).json({
    status: 'success',
    data: { campaign }
  });
});

export const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
  const campaigns = await CampaignService.getAllCampaigns();
  res.status(200).json({
    status: 'success',
    results: campaigns.length,
    data: { campaigns }
  });
});

export const getCampaignById = catchAsync(async (req: Request, res: Response) => {
  const campaign = await CampaignService.getCampaignById(req.params.id as string);
  res.status(200).json({
    status: 'success',
    data: { campaign }
  });
});

export const createCampaign = catchAsync(async (req: Request, res: Response) => {
  const campaign = await CampaignService.createCampaign(req.body);
  res.status(201).json({
    status: 'success',
    data: { campaign }
  });
});

export const updateCampaign = catchAsync(async (req: Request, res: Response) => {
  const campaign = await CampaignService.updateCampaign(req.params.id as string, req.body);
  res.status(200).json({
    status: 'success',
    data: { campaign }
  });
});

export const deleteCampaign = catchAsync(async (req: Request, res: Response) => {
  await CampaignService.deleteCampaign(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null
  });
});
