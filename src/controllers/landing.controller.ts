import { Request, Response } from 'express';
import { LandingService } from '../services/landing.service';
import { catchAsync } from '../utils/catchAsync';

export const getLandingData = catchAsync(async (req: Request, res: Response) => {
  const data = await LandingService.getLandingData();

  // Disable stale HTTP caching so admin campaign & banner updates reflect instantly
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');

  res.status(200).json({
    status: 'success',
    data
  });
});
