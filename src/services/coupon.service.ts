import { Coupon } from '../models/coupon.model';
import { AppError } from '../utils/appError';

export class CouponService {
  static async createCoupon(data: any) {
    const existing = await Coupon.findOne({ code: data.code.toUpperCase() });
    if (existing) throw new AppError('Coupon code already exists', 400);
    return Coupon.create({ ...data, code: data.code.toUpperCase() });
  }

  static async getAllCoupons() {
    return Coupon.find().sort({ createdAt: -1 });
  }

  static async getCouponById(id: string) {
    const coupon = await Coupon.findById(id);
    if (!coupon) throw new AppError('Coupon not found', 404);
    return coupon;
  }

  static async updateCoupon(id: string, data: any) {
    const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!coupon) throw new AppError('Coupon not found', 404);
    return coupon;
  }

  static async deleteCoupon(id: string) {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) throw new AppError('Coupon not found', 404);
    return coupon;
  }

  static async validateCoupon(code: string, orderAmount: number) {
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      throw new AppError('Invalid coupon code', 400);
    }

    if (new Date() > coupon.expiryDate) {
      throw new AppError('Coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new AppError('Coupon usage limit has been reached', 400);
    }

    if (orderAmount < coupon.minOrderAmount) {
      throw new AppError(`Minimum order amount for this coupon is BDT ${coupon.minOrderAmount}`, 400);
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed order amount
    discount = Math.min(discount, orderAmount);

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount
    };
  }
}
