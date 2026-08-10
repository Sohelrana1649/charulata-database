import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';
import { catchAsync } from '../utils/catchAsync';

export const createCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await CouponService.createCoupon(req.body);
  res.status(201).json({
    status: 'success',
    data: { coupon }
  });
});

export const getAllCoupons = catchAsync(async (req: Request, res: Response) => {
  const coupons = await CouponService.getAllCoupons();
  res.status(200).json({
    status: 'success',
    results: coupons.length,
    data: { coupons }
  });
});

export const getCouponById = catchAsync(async (req: Request, res: Response) => {
  const coupon = await CouponService.getCouponById(req.params.id as string);
  res.status(200).json({
    status: 'success',
    data: { coupon }
  });
});

export const updateCoupon = catchAsync(async (req: Request, res: Response) => {
  const coupon = await CouponService.updateCoupon(req.params.id as string, req.body);
  res.status(200).json({
    status: 'success',
    data: { coupon }
  });
});

export const deleteCoupon = catchAsync(async (req: Request, res: Response) => {
  await CouponService.deleteCoupon(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null
  });
});

export const validateCoupon = catchAsync(async (req: Request, res: Response) => {
  const { code, orderAmount } = req.body;
  const result = await CouponService.validateCoupon(code, Number(orderAmount));
  res.status(200).json({
    status: 'success',
    data: result
  });
});
