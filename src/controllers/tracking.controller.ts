import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendMetaEvent, MetaUserData, getMetaRequestContext } from '../utils/metaPixel';

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

  // The server must reuse the exact eventID the browser passed to fbq(). Never generate a new one here,
  // otherwise Meta sees two different events and counts the conversion twice.
  if (!eventId || typeof eventId !== 'string' || eventId.length > 128) {
    return res.status(400).json({
      status: 'fail',
      message: 'eventId (the same ID used in the browser fbq eventID) is required for deduplication',
    });
  }

  const ctx = getMetaRequestContext(req, {
    fbp: userData.fbp,
    fbc: userData.fbc,
    sourceUrl: eventSourceUrl,
  });

  const enrichedUserData: MetaUserData = {
    ...userData,
    clientIpAddress: ctx.clientIpAddress,
    clientUserAgent: ctx.clientUserAgent,
    fbp: ctx.fbp,
    fbc: ctx.fbc,
  };

  const activeTestCode = testEventCode || (req.headers['x-meta-test-event-code'] as string) || undefined;

  // Fire CAPI event asynchronously without blocking response
  sendMetaEvent({
    eventName,
    eventId,
    actionSource: 'website',
    eventSourceUrl: ctx.sourceUrl,
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
