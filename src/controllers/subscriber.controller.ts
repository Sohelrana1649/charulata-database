import { Request, Response } from 'express';
import { SubscriberService } from '../services/subscriber.service';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/appError';

export const subscribeEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const subscriber = await SubscriberService.subscribe(email);
  res.status(201).json({
    status: 'success',
    message: 'Successfully subscribed to Charulata Maison newsletter',
    data: { subscriber }
  });
});

export const getAllSubscribers = catchAsync(async (req: Request, res: Response) => {
  const subscribers = await SubscriberService.getAllSubscribers();
  res.status(200).json({
    status: 'success',
    results: subscribers.length,
    data: { subscribers }
  });
});

export const unsubscribeEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await SubscriberService.unsubscribe(email);
  res.status(200).json({
    status: 'success',
    message: 'Successfully unsubscribed from newsletter'
  });
});

export const sendPromotionalEmail = catchAsync(async (req: Request, res: Response) => {
  const { subject, message } = req.body;
  if (!subject || !message) {
    throw new AppError('Subject and message are required for promotion', 400);
  }
  const result = await SubscriberService.sendBulkPromotion(subject, message);
  res.status(200).json({
    status: 'success',
    message: `Promotional email campaign triggered successfully for ${result.sentCount} subscribers.`,
    data: result
  });
});
