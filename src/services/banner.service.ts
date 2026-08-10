import { Banner } from '../models/banner.model';
import { AppError } from '../utils/appError';
import { uploadBase64ToCloudinary } from '../utils/cloudinary';

export class BannerService {
  static async createBanner(data: any) {
    let image = data.image;
    if (image && typeof image === 'string' && image.startsWith('data:image')) {
      image = await uploadBase64ToCloudinary(image, 'charulata_banners');
    }
    return Banner.create({ ...data, image });
  }

  static async getActiveBanners() {
    return Banner.find({ isActive: true }).sort({ position: 1 });
  }

  static async getAllBanners() {
    return Banner.find().sort({ position: 1 });
  }

  static async updateBanner(id: string, data: any) {
    const updateData = { ...data };
    if (updateData.image && typeof updateData.image === 'string' && updateData.image.startsWith('data:image')) {
      updateData.image = await uploadBase64ToCloudinary(updateData.image, 'charulata_banners');
    }
    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!banner) throw new AppError('Banner not found', 404);
    return banner;
  }

  static async deleteBanner(id: string) {
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) throw new AppError('Banner not found', 404);
    return banner;
  }
}
