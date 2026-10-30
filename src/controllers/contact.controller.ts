import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';
import { catchAsync } from '../utils/catchAsync';
import { trackContact, getMetaRequestContext } from '../utils/metaPixel';

export const submitContactForm = catchAsync(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  const contact = await ContactService.createMessage({ name, email, message });

  const ctx = getMetaRequestContext(req);
  const metaEventId = req.body._eventId || req.body.eventId || undefined;

  // Fire-and-forget: Track Contact event on Meta CAPI (unless explicitly skipped because frontend sent via proxy)
  if (!req.body._skipCapi) {
    trackContact({
      email,
      firstName: name?.split(' ')[0],
      clientIpAddress: ctx.clientIpAddress,
      clientUserAgent: ctx.clientUserAgent,
      fbp: ctx.fbp,
      fbc: ctx.fbc,
    }, metaEventId, req.body._testEventCode || req.body.testEventCode || (req.headers['x-meta-test-event-code'] as string), ctx.sourceUrl)
    .catch(err => console.error('[META CAPI] contact error:', err));
  }

  res.status(201).json({
    status: 'success',
    message: 'Message sent successfully. We will get back to you shortly.',
    metaEventId,
    data: { contact }
  });
});

export const getAllContactMessages = catchAsync(async (req: Request, res: Response) => {
  const messages = await ContactService.getAllMessages();
  res.status(200).json({
    status: 'success',
    results: messages.length,
    data: { messages }
  });
});

export const markContactMessageRead = catchAsync(async (req: Request, res: Response) => {
  const message = await ContactService.markAsRead(req.params.id as string);
  res.status(200).json({
    status: 'success',
    data: { message }
  });
});

export const deleteContactMessage = catchAsync(async (req: Request, res: Response) => {
  await ContactService.deleteMessage(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null
  });
});
