import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { SettingsService } from '../services/settings.service';
import { catchAsync } from '../utils/catchAsync';

export const getSettings = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const settings = await SettingsService.getSettings();
  res.status(200).json({
    status: 'success',
    data: settings,
  });
});

export const updateSettings = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const updatedSettings = await SettingsService.updateSettings(req.body);
  res.status(200).json({
    status: 'success',
    data: updatedSettings,
    message: 'Store settings updated successfully',
  });
});
