import { Settings, ISettings } from '../models/settings.model';
import { uploadBase64ToCloudinary } from '../utils/cloudinary';

export class SettingsService {
  /**
   * Get store settings. Creates default settings document if none exists.
   */
  static async getSettings(): Promise<ISettings> {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    if (settings.requireAdvancePayment === undefined || settings.requireAdvancePayment === null) {
      settings.requireAdvancePayment = true;
      await settings.save();
    }
    return settings;
  }

  /**
   * Update store settings.
   */
  static async updateSettings(updateData: Partial<ISettings>): Promise<ISettings> {
    const data = { ...updateData };
    if (data.navbarLogo && typeof data.navbarLogo === 'string' && data.navbarLogo.startsWith('data:image')) {
      data.navbarLogo = await uploadBase64ToCloudinary(data.navbarLogo, 'charulata_settings');
    }
    if (data.footerLogo && typeof data.footerLogo === 'string' && data.footerLogo.startsWith('data:image')) {
      data.footerLogo = await uploadBase64ToCloudinary(data.footerLogo, 'charulata_settings');
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(data);
    } else {
      if (typeof data.requireAdvancePayment === 'boolean') {
        settings.requireAdvancePayment = data.requireAdvancePayment;
        settings.markModified('requireAdvancePayment');
      }
      Object.assign(settings, data);
      await settings.save();
    }
    return settings;
  }
}
