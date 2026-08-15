import { Product } from '../models/product.model';
import { Banner } from '../models/banner.model';
import { Category } from '../models/category.model';
import { Review } from '../models/review.model';
import { CampaignService } from './campaign.service';

// Fields needed for product cards on the landing page (no full description, no variants)
const PRODUCT_CARD_FIELDS = 'title slug price salePrice productImages badge bestSelling newArrival flashSale discountStartDate discountEndDate ratings _id';

export class LandingService {
  /**
   * Fetch all landing page data in a single concurrent operation.
   * Uses Promise.all to run all queries simultaneously, .lean() for plain JS objects,
   * and .select() to return only the fields needed for the UI.
   */
  static async getLandingData() {
    const [
      banners,
      categories,
      rawBestSelling,
      rawNewArrivals,
      rawFlashSale,
      allProducts,
      reviews,
      activeCampaign
    ] = await Promise.all([
      // 1. Active banners — sorted by position
      Banner.find({ isActive: true })
        .sort({ position: 1 })
        .select('title subtitle image link position')
        .lean(),

      // 2. All active categories
      Category.find({ isActive: true })
        .select('name nameBn slug image')
        .lean(),

      // 3. Best selling products (up to 15)
      Product.find({ isActive: true, bestSelling: true })
        .select(PRODUCT_CARD_FIELDS)
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),

      // 4. New arrivals (up to 15)
      Product.find({ isActive: true, newArrival: true })
        .select(PRODUCT_CARD_FIELDS)
        .sort({ createdAt: -1 })
        .limit(15)
        .lean(),

      // 5. Flash sale products (up to 12) - strictly filter out expired discountEndDate
      Product.find({
        isActive: true,
        flashSale: true,
        $or: [
          { discountEndDate: { $exists: false } },
          { discountEndDate: null },
          { discountEndDate: { $gt: new Date() } }
        ]
      })
        .select(PRODUCT_CARD_FIELDS)
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),

      // 6. All active products (up to 20)
      Product.find({ isActive: true })
        .select(PRODUCT_CARD_FIELDS)
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),

      // 7. Approved high-rated reviews for testimonials (top 10)
      Review.find({ status: 'Approved', rating: { $gte: 4 } })
        .populate('customer', 'name profileImage')
        .populate('product', 'title slug')
        .limit(10)
        .sort({ createdAt: -1 })
        .lean(),

      // 8. Currently active campaign for promotional countdown banner
      CampaignService.getActiveCampaign()
    ]);

    // Fallback: If bestSelling has fewer than 5 items in DB, fill up to 10 with other active products
    let bestSelling = rawBestSelling;
    if (bestSelling.length < 5 && allProducts.length > 0) {
      const existingIds = new Set(bestSelling.map(p => p._id.toString()));
      const extra = allProducts.filter(p => !existingIds.has(p._id.toString())).slice(0, 10 - bestSelling.length);
      bestSelling = [...bestSelling, ...extra];
    }

    // Fallback: If newArrivals has fewer than 5 items in DB, fill up to 10 with other active products
    let newArrivals = rawNewArrivals;
    if (newArrivals.length < 5 && allProducts.length > 0) {
      const existingIds = new Set(newArrivals.map(p => p._id.toString()));
      const extra = allProducts.filter(p => !existingIds.has(p._id.toString())).slice(0, 10 - newArrivals.length);
      newArrivals = [...newArrivals, ...extra];
    }

    // Fallback: If flashSale has fewer than 4 items in DB, fill with active products
    let flashSale = rawFlashSale;
    if (flashSale.length < 4 && allProducts.length > 0) {
      const existingIds = new Set(flashSale.map(p => p._id.toString()));
      const extra = allProducts.filter(p => !existingIds.has(p._id.toString())).slice(0, 8 - flashSale.length);
      flashSale = [...flashSale, ...extra];
    }

    return {
      banners,
      categories,
      bestSelling,
      newArrivals,
      flashSale,
      allProducts,
      reviews,
      campaign: activeCampaign
    };
  }
}
