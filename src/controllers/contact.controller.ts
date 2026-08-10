import { Request, Response } from 'express';
import { ContactService } from '../services/contact.service';
import { catchAsync } from '../utils/catchAsync';

export const submitContactForm = catchAsync(async (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  const contact = await ContactService.createMessage({ name, email, message });
  res.status(201).json({
    status: 'success',
    message: 'Message sent successfully. We will get back to you shortly.',
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
