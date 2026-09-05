import { Lead, ILead, ICartSnapshotItem } from "../models/lead.model";
import { AppError } from "../utils/appError";

export interface ISaveLeadInput {
  name?: string;
  phone: string;
  cartSnapshot?: ICartSnapshotItem[];
  cartTotal?: number;
}

export interface IGetLeadsQuery {
  page?: number;
  limit?: number;
  converted?: string;
  search?: string;
}

export class LeadService {
  static normalizePhone(rawPhone: string): string {
    const cleaned = (rawPhone || "").replace(/[\s\-]/g, "");
    if (cleaned.startsWith("+8801")) return cleaned.slice(3);
    if (cleaned.startsWith("8801")) return cleaned.slice(2);
    return cleaned;
  }

  static async saveLead(input: ISaveLeadInput): Promise<ILead> {
    const cleanPhone = this.normalizePhone(input.phone);
    if (!cleanPhone || !/^01[3-9]\d{8}$/.test(cleanPhone)) {
      throw new AppError("Valid 11-digit Bangladeshi phone number is required", 400);
    }

    const updateData: any = {
      $set: {
        updatedAt: new Date()
      },
      $setOnInsert: {
        phone: cleanPhone,
        capturedAt: new Date(),
        converted: false
      }
    };

    if (input.name && input.name.trim()) {
      updateData.$set.name = input.name.trim();
    }

    if (Array.isArray(input.cartSnapshot) && input.cartSnapshot.length > 0) {
      updateData.$set.cartSnapshot = input.cartSnapshot.map(item => ({
        productId: (item.productId && String(item.productId).length === 24) ? (String(item.productId) as any) : undefined,
        name: item.name || "Product",
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0,
        image: item.image,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize
      }));
    }

    if (input.cartTotal !== undefined && input.cartTotal !== null) {
      updateData.$set.cartTotal = Number(input.cartTotal) || 0;
    }

    const lead = await Lead.findOneAndUpdate(
      { phone: cleanPhone },
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return lead;
  }

  static async getLeads(queryOptions: IGetLeadsQuery) {
    const page = Math.max(1, Number(queryOptions.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(queryOptions.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (queryOptions.converted === "true") {
      filter.converted = true;
    } else if (queryOptions.converted === "false") {
      filter.converted = false;
    }

    if (queryOptions.search && queryOptions.search.trim()) {
      const searchRegex = new RegExp(queryOptions.search.trim(), "i");
      filter.$or = [{ name: searchRegex }, { phone: searchRegex }];
    }

    const [leads, total, totalLeads, convertedCount] = await Promise.all([
      Lead.find(filter)
        .populate("orderId", "orderId totalAmount deliveryStatus createdAt paymentMethod")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(filter),
      Lead.countDocuments({}),
      Lead.countDocuments({ converted: true })
    ]);

    const unconvertedCount = totalLeads - convertedCount;
    const conversionRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : "0.0";

    return {
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      },
      stats: {
        totalLeads,
        convertedCount,
        unconvertedCount,
        conversionRate
      }
    };
  }

  static async markConvertedByPhone(phone: string, orderId: any): Promise<ILead | null> {
    const cleanPhone = this.normalizePhone(phone);
    if (!cleanPhone) return null;

    return Lead.findOneAndUpdate(
      { phone: cleanPhone },
      {
        $set: {
          converted: true,
          convertedAt: new Date(),
          orderId
        }
      },
      { new: true }
    );
  }

  static async deleteLead(id: string): Promise<void> {
    await Lead.findByIdAndDelete(id);
  }
}
