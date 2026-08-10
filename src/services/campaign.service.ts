import { Campaign, ICampaign } from '../models/campaign.model';
import { AppError } from '../utils/appError';

export class CampaignService {
  /**
   * Get the current live active campaign.
   * Checks isActive = true, and respects startDate & endDate schedule if provided.
   */
  static async getActiveCampaign(): Promise<ICampaign | null> {
    const now = new Date();

    const activeCampaigns = await Campaign.find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 });

    if (!activeCampaigns || activeCampaigns.length === 0) {
      return null;
    }

    // Find first active campaign that is currently valid
    for (const campaign of activeCampaigns) {
      const hasEnd = !!campaign.endDate;
      const hasStart = !!campaign.startDate;

      // If campaign has an endDate and current time is past endDate, skip (expired)
      if (hasEnd && now > new Date(campaign.endDate!)) {
        continue;
      }

      // If campaign has a startDate that is more than 24 hours in the future, skip (future scheduled)
      if (hasStart) {
        const startTime = new Date(campaign.startDate!).getTime();
        if (startTime - now.getTime() > 24 * 60 * 60 * 1000) {
          continue;
        }
      }

      return campaign;
    }

    return null;
  }

  /**
   * Get all campaigns (Admin view)
   */
  static async getAllCampaigns(): Promise<ICampaign[]> {
    return Campaign.find({}).sort({ priority: -1, createdAt: -1 });
  }

  /**
   * Get campaign by ID
   */
  static async getCampaignById(id: string): Promise<ICampaign> {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }
    return campaign;
  }

  /**
   * Create a new campaign
   */
  static async createCampaign(data: Partial<ICampaign>): Promise<ICampaign> {
    return Campaign.create(data);
  }

  /**
   * Update an existing campaign
   */
  static async updateCampaign(id: string, data: Partial<ICampaign>): Promise<ICampaign> {
    const campaign = await Campaign.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }
    return campaign;
  }

  /**
   * Delete a campaign
   */
  static async deleteCampaign(id: string): Promise<void> {
    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      throw new AppError('Campaign not found', 404);
    }
  }
}
