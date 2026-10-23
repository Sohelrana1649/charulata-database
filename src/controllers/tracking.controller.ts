import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendMetaEvent, MetaUserData } from '../utils/metaPixel';

/**
 * Controller to handle public client-side Meta Conversions API (CAPI) events
 * Allows Next.js frontend to relay browser events (ViewContent, AddToCart, InitiateCheckout)
 * to the server with matching event IDs for perfect deduplication.
 */
export const handleMetaTrackingEvent = catchAsync(async (req: Request, res: Response) => {
  const { eventName, eventId, eventSourceUrl, customData, userData = {}, testEventCode } = req.body;

  if (!eventName || typeof eventName !== 'string') {
    return res.status(400).json({ status: 'fail', message: 'eventName is required' });
  }

  // Allowed CAPI standard events
  const allowedEvents = [
    'ViewContent',
    'AddToCart',
    'InitiateCheckout',
    'Search',
    'Contact',
    'PageView',
    'CustomizeProduct',
    'AddToWishlist',
  ];

  if (!allowedEvents.includes(eventName)) {
    return res.status(400).json({ status: 'fail', message: `Event ${eventName} not supported via tracking proxy` });
  }

  // Extract client IP & User Agent from real request headers
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || req.ip;
  const clientUserAgent = (req.headers['user-agent'] as string) || '';

  const enrichedUserData: MetaUserData = {
    ...userData,
    clientIpAddress: clientIp,
    clientUserAgent: clientUserAgent,
  };

  const activeTestCode = testEventCode || (req.headers['x-meta-test-event-code'] as string) || undefined;

  // Fire CAPI event asynchronously without blocking response
  sendMetaEvent({
    eventName,
    eventId,
    eventSourceUrl: eventSourceUrl || req.headers.referer || undefined,
    userData: enrichedUserData,
    customData,
    testEventCode: activeTestCode,
  }).catch(err => {
    console.error(`[TRACKING CONTROLLER] Meta CAPI failed for ${eventName}:`, err);
  });

  return res.status(200).json({
    status: 'success',
    message: `Event ${eventName} dispatched to Meta CAPI`,
    eventId,
  });
});
