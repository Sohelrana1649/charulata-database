import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { UserService } from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';

export const addAddress = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const addresses = await UserService.addAddress(userId, req.body);
  res.status(200).json({
    status: 'success',
    data: { addresses }
  });
});

export const updateAddress = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const addressId = req.params.addressId as string;
  const addresses = await UserService.updateAddress(userId, addressId, req.body);
  res.status(200).json({
    status: 'success',
    data: { addresses }
  });
});

export const deleteAddress = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const addressId = req.params.addressId as string;
  const addresses = await UserService.deleteAddress(userId, addressId);
  res.status(200).json({
    status: 'success',
    data: { addresses }
  });
});

export const getWishlist = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const products = await UserService.getWishlist(userId);
  res.status(200).json({
    status: 'success',
    data: { products }
  });
});

export const addToWishlist = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const { productId } = req.body;
  const wishlist = await UserService.addToWishlist(userId, productId);
  res.status(200).json({
    status: 'success',
    data: { wishlist }
  });
});

export const removeFromWishlist = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const productId = req.params.productId as string;
  const wishlist = await UserService.removeFromWishlist(userId, productId);
  res.status(200).json({
    status: 'success',
    data: { wishlist }
  });
});

export const updateProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const user = await UserService.updateProfile(userId, req.body);
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const changePassword = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!._id.toString();
  const result = await UserService.changePassword(userId, req.body);
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const getAllUsersAdmin = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const users = await UserService.getAllUsersAdmin();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users }
  });
});

export const updateUserRoleAdmin = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const operatorUser = req.user!;
  const userId = req.params.userId as string;
  const { role } = req.body;
  const user = await UserService.updateUserRoleAdmin(operatorUser, userId, role);
  res.status(200).json({
    status: 'success',
    message: 'User role updated successfully',
    data: { user }
  });
});
