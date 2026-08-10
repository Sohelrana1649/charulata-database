import { DeliveryZone } from '../models/delivery.model';
import { config } from '../config';
import { AppError } from '../utils/appError';

export class DeliveryService {
  static async createOrUpdateZone(data: any) {
    const { district, shippingCharge, estimatedDeliveryTime, courierName, codAvailable, isActive } = data;
    const formattedDistrict = district.trim();

    return DeliveryZone.findOneAndUpdate(
      { district: { $regex: new RegExp(`^${formattedDistrict}$`, 'i') } },
      {
        district: formattedDistrict,
        shippingCharge,
        estimatedDeliveryTime,
        courierName,
        codAvailable,
        isActive
      },
      { new: true, upsert: true, runValidators: true }
    );
  }

  static async getAllZones() {
    return DeliveryZone.find().sort({ district: 1 });
  }

  static async getActiveDistricts() {
    return DeliveryZone.find({ isActive: true }).sort({ district: 1 });
  }

  static async deleteZone(id: string) {
    const zone = await DeliveryZone.findByIdAndDelete(id);
    if (!zone) throw new AppError('Delivery zone not found', 404);
    return zone;
  }

  static async getChargeForDistrict(districtName: string) {
    const zone = await DeliveryZone.findOne({
      district: { $regex: new RegExp(`^${districtName.trim()}$`, 'i') },
      isActive: true
    });

    if (zone) {
      return {
        district: zone.district,
        shippingCharge: zone.shippingCharge,
        estimatedDeliveryTime: zone.estimatedDeliveryTime,
        courierName: zone.courierName,
        codAvailable: zone.codAvailable
      };
    }

    // Default Fallbacks
    const isDhaka = /dhaka|ঢাকা/i.test(districtName);
    return {
      district: districtName,
      shippingCharge: isDhaka ? config.shippingChargeInsideDhaka : config.shippingChargeOutsideDhaka,
      estimatedDeliveryTime: isDhaka ? '1-2 Days' : '3-5 Days',
      courierName: 'Default Courier',
      codAvailable: true
    };
  }
}
