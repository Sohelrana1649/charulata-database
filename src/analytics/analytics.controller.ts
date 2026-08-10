import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { AnalyticsService } from './analytics.service';
import { catchAsync } from '../utils/catchAsync';

export const getDashboardOverview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await AnalyticsService.getDashboardOverview();
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getRevenueAnalytics = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { range } = req.query;
  const data = await AnalyticsService.getRevenueAnalytics(range as string);
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getSalesChartData = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { timeframe } = req.query;
  const data = await AnalyticsService.getSalesChartData(timeframe as string);
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getOrdersAnalytics = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await AnalyticsService.getOrdersAnalytics();
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getCustomerAnalytics = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await AnalyticsService.getCustomerAnalytics();
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getProductAnalytics = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await AnalyticsService.getProductAnalytics();
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getReviewAnalytics = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await AnalyticsService.getReviewAnalytics();
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getCategoryAnalytics = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await AnalyticsService.getCategoryAnalytics();
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getRecentOrders = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await AnalyticsService.getRecentOrders();
  res.status(200).json({
    status: 'success',
    data
  });
});

export const getNotificationAnalytics = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await AnalyticsService.getNotificationAnalytics();
  res.status(200).json({
    status: 'success',
    data
  });
});

export const exportAnalytics = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const data = await AnalyticsService.getExportAnalyticsData();
  res.status(200).json({
    status: 'success',
    data
  });
});
