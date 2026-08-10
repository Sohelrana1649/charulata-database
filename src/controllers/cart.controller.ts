import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { CartService } from '../services/cart.service';
import { catchAsync } from '../utils/catchAsync';

export const getCart = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const cart = await CartService.getCart(userId);
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

export const addToCart = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const cart = await CartService.addToCart(userId, req.body);
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

export const updateCartItem = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const itemId = req.params.itemId as string;
  const { quantity } = req.body;
  const cart = await CartService.updateCartItem(userId, itemId, quantity);
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

export const removeFromCart = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const itemId = req.params.itemId as string;
  const cart = await CartService.removeFromCart(userId, itemId);
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

export const clearCart = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const cart = await CartService.clearCart(userId);
  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});
