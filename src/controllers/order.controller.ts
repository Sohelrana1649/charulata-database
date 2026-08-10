import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { OrderService } from '../services/order.service';
import { catchAsync } from '../utils/catchAsync';
import { trackPurchase } from '../utils/metaPixel';

export const checkout = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const order = await OrderService.checkout(userId, req.body);

  // Fire-and-forget: Send Purchase event to Meta Conversions API
  trackPurchase({
    orderId: order._id?.toString() || order.orderId || '',
    totalAmount: order.totalAmount || 0,
    currency: 'BDT',
    items: (order.items || []).map((item: any) => ({
      productId: item.product?._id?.toString() || item.product?.toString() || '',
      name: item.name || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
    })),
    userData: {
      email: req.user?.email,
      phone: req.user?.phone,
      firstName: req.user?.name?.split(' ')[0],
      externalId: userId,
      clientIpAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
      clientUserAgent: req.headers['user-agent'],
      fbp: req.body._fbp,
      fbc: req.body._fbc,
    },
    eventId: req.body._eventId,
  }).catch(err => console.error('[META CAPI] checkout error:', err));

  res.status(201).json({
    status: 'success',
    data: { order }
  });
});

export const guestCheckout = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderService.guestCheckout(req.body);

  // Fire-and-forget: Send Purchase event to Meta Conversions API
  trackPurchase({
    orderId: order._id?.toString() || order.orderId || '',
    totalAmount: order.totalAmount || 0,
    currency: 'BDT',
    items: (order.items || []).map((item: any) => ({
      productId: item.product?._id?.toString() || item.product?.toString() || '',
      name: item.name || '',
      quantity: item.quantity || 1,
      price: item.price || 0,
    })),
    userData: {
      email: req.body.email,
      phone: req.body.phone || req.body.shippingAddress?.recipientPhone,
      firstName: req.body.name?.split(' ')[0] || req.body.shippingAddress?.recipientName?.split(' ')[0],
      city: req.body.shippingAddress?.district,
      country: 'bd',
      clientIpAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
      clientUserAgent: req.headers['user-agent'],
      fbp: req.body._fbp,
      fbc: req.body._fbc,
    },
    eventId: req.body._eventId,
  }).catch(err => console.error('[META CAPI] guestCheckout error:', err));

  res.status(201).json({
    status: 'success',
    message: 'Order placed successfully',
    data: { order }
  });
});

export const getOrderHistory = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const orders = await OrderService.getOrderHistory(userId);
  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders }
  });
});

export const getOrderById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const role = req.user!.role;
  const order = await OrderService.getOrderById(req.params.id as string, userId, role);
  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

export const trackOrder = catchAsync(async (req: Request, res: Response) => {
  const { orderId, email } = req.body;
  if (!orderId || !email) {
    res.status(400).json({
      status: 'fail',
      message: 'Both Order ID and Email are required to track your order.'
    });
    return;
  }
  const trackingData = await OrderService.trackOrder(orderId as string, email as string);
  res.status(200).json({
    status: 'success',
    data: trackingData
  });
});

export const getAllOrders = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await OrderService.getAllOrders(req.query);
  res.status(200).json({
    status: 'success',
    ...result
  });
});

export const updateOrderStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { status, deliveryNotes } = req.body;
  const order = await OrderService.updateOrderStatus(id, status, deliveryNotes);
  res.status(200).json({
    status: 'success',
    data: { order }
  });
});

export const bulkUpdateOrderStatus = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { orderIds, status, deliveryNotes } = req.body;
  const result = await OrderService.bulkUpdateOrderStatus(orderIds, status, deliveryNotes);
  res.status(200).json({
    status: 'success',
    data: result
  });
});
