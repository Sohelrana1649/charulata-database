import { Product } from '../models/product.model';
import { Category } from '../models/category.model';
import { slugify } from '../utils/slugify';
import { AppError } from '../utils/appError';
import { AnalyticsLog } from '../models/analyticsLog.model';
import { uploadBase64ToCloudinary } from '../utils/cloudinary';

export class ProductService {
  static async createProduct(data: any) {
    const slug = slugify(data.title);
    const existing = await Product.findOne({ slug });
    if (existing) {
      throw new AppError('Product with this title already exists', 400);
    }

    // Check if category exists
    const categoryExists = await Category.findById(data.category);
    if (!categoryExists) {
      throw new AppError('Invalid category ID', 400);
    }

    let image = data.image;
    if (image && typeof image === 'string' && image.startsWith('data:image')) {
      image = await uploadBase64ToCloudinary(image, 'charulata_products');
    }

    let images = data.images;
    if (Array.isArray(images)) {
      images = await Promise.all(
        images.map(img => typeof img === 'string' && img.startsWith('data:image') ? uploadBase64ToCloudinary(img, 'charulata_products') : img)
      );
    }

    return Product.create({ ...data, image, images, slug });
  }

  static async updateProduct(id: string, data: any) {
    const updateData = { ...data };
    if (data.title) {
      updateData.slug = slugify(data.title);
    }

    if (data.category) {
      const categoryExists = await Category.findById(data.category);
      if (!categoryExists) {
        throw new AppError('Invalid category ID', 400);
      }
    }

    if (updateData.image && typeof updateData.image === 'string' && updateData.image.startsWith('data:image')) {
      updateData.image = await uploadBase64ToCloudinary(updateData.image, 'charulata_products');
    }

    if (Array.isArray(updateData.images)) {
      updateData.images = await Promise.all(
        updateData.images.map((img: string) => typeof img === 'string' && img.startsWith('data:image') ? uploadBase64ToCloudinary(img, 'charulata_products') : img)
      );
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  static async deleteProduct(id: string) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  static async bulkUpdateProducts(productIds: string[], updateData: any) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new AppError('No product IDs provided for bulk update', 400);
    }

    const allowedFields: any = {};
    if (typeof updateData.isActive === 'boolean') allowedFields.isActive = updateData.isActive;
    if (typeof updateData.isFeatured === 'boolean') allowedFields.isFeatured = updateData.isFeatured;
    if (typeof updateData.isFlashSale === 'boolean') allowedFields.isFlashSale = updateData.isFlashSale;
    if (typeof updateData.stockQuantity === 'number') allowedFields.stockQuantity = updateData.stockQuantity;
    if (updateData.category) allowedFields.category = updateData.category;

    if (Object.keys(allowedFields).length > 0) {
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $set: allowedFields }
      );
    }

    return {
      updatedCount: productIds.length
    };
  }

  static async bulkDeleteProducts(productIds: string[]) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new AppError('No product IDs provided for bulk delete', 400);
    }

    const result = await Product.deleteMany({ _id: { $in: productIds } });
    return {
      deletedCount: result.deletedCount || productIds.length
    };
  }

  static async getProductBySlug(slugOrId: string, userId?: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    const query = isObjectId ? { $or: [{ slug: slugOrId }, { _id: slugOrId }] } : { slug: slugOrId };

    const product = await Product.findOne(query).populate('category').lean();
    if (!product) throw new AppError('Product not found', 404);

    // Non-blocking async background analytics & view updates for ultra-fast response
    Product.updateOne({ _id: product._id }, { $inc: { views: 1 } }).catch(() => {});
    AnalyticsLog.create({
      eventType: 'ProductView',
      user: userId,
      product: product._id,
      metadata: { slug: product.slug }
    }).catch(() => {});

    return product;
  }

  static async getProducts(queryParams: any) {
    const {
      search,
      category,
      color,
      minPrice,
      maxPrice,
      bestSelling,
      newArrival,
      flashSale,
      sort,
      page = 1,
      limit = 10
    } = queryParams;

    const filter: any = { isActive: true };
    const andConditions: any[] = [];

    // Helper for color keywords mapping
    const getColorKeywords = (col: string): string[] => {
      const lower = String(col).toLowerCase().trim();
      switch (lower) {
        case 'magenta':
        case 'pink':
          return ['#d946ef', 'magenta', 'pink', 'rose', 'crimson', 'red'];
        case 'purple':
          return ['#a855f7', 'purple', 'violet', 'lavender', 'mauve'];
        case 'gold':
        case 'yellow':
          return ['#c99a3c', 'gold', 'yellow', 'golden', 'amber'];
        case 'white':
          return ['#ffffff', 'white', 'cream', 'ivory'];
        case 'dark':
        case 'black':
        case 'navy':
          return ['#1e293b', 'dark', 'black', 'navy', 'blue', 'royal blue'];
        case 'green':
          return ['#10b981', 'green', 'emerald', 'olive'];
        default:
          return [lower, `#${lower}`];
      }
    };

    // 1) Search filter: substring & category matching regex
    if (search) {
      const escapedSearch = String(search).trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      const matchingCategories = await Category.find({
        $or: [
          { name: searchRegex },
          { slug: searchRegex }
        ]
      });
      const matchingCategoryIds = matchingCategories.map(c => c._id);

      andConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
          { category: { $in: matchingCategoryIds } }
        ]
      });
    }

    // 2) Category filter
    if (category && category !== 'all') {
      // Check if category matches ObjectId, else find by slug or name
      if (String(category).match(/^[0-9a-fA-F]{24}$/)) {
        andConditions.push({ category });
      } else {
        const cleanCat = String(category).trim();
        const catRegex = new RegExp(`^${cleanCat.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
        
        let cat = await Category.findOne({
          $or: [
            { slug: catRegex },
            { name: catRegex }
          ]
        });

        if (!cat) {
          const keywordsPattern = cleanCat.split('-').map(s => s.trim()).filter(Boolean).join('|');
          if (keywordsPattern) {
            const flexRegex = new RegExp(keywordsPattern, 'i');
            const matchingCats = await Category.find({
              $or: [
                { slug: flexRegex },
                { name: flexRegex }
              ]
            });
            if (matchingCats.length > 0) {
              andConditions.push({ category: { $in: matchingCats.map(c => c._id) } });
            } else {
              andConditions.push({
                $or: [
                  { title: flexRegex },
                  { description: flexRegex },
                  { tags: { $in: [flexRegex] } }
                ]
              });
            }
          }
        } else {
          andConditions.push({ category: cat._id });
        }
      }
    }

    // 3) Color filter
    if (color) {
      const keywords = getColorKeywords(color);
      const colorOrConditions: any[] = [];

      for (const kw of keywords) {
        const regex = new RegExp(kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
        colorOrConditions.push({ colors: kw });
        colorOrConditions.push({ colors: regex });
        colorOrConditions.push({ 'variants.color': regex });
        colorOrConditions.push({ title: regex });
        colorOrConditions.push({ tags: regex });
      }

      andConditions.push({ $or: colorOrConditions });
    }

    // 4) Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || Infinity;
      
      andConditions.push({
        $or: [
          { salePrice: { $gte: min, $lte: max } },
          {
            $and: [
              { $or: [{ salePrice: { $exists: false } }, { salePrice: null }, { salePrice: 0 }] },
              { price: { $gte: min, $lte: max } }
            ]
          }
        ]
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // 4) Flags
    if (bestSelling === 'true') filter.bestSelling = true;
    if (newArrival === 'true') filter.newArrival = true;
    if (flashSale === 'true') {
      filter.flashSale = true;
      andConditions.push({
        $or: [
          { discountEndDate: { $exists: false } },
          { discountEndDate: null },
          { discountEndDate: { $gt: new Date() } }
        ]
      });
      filter.$and = andConditions;
    }

    // Build query
    let query = Product.find(filter).populate('category');

    // 5) Sorting
    if (sort) {
      switch (sort) {
        case 'price-asc':
          query = query.sort({ price: 1 });
          break;
        case 'price-desc':
          query = query.sort({ price: -1 });
          break;
        case 'newest':
          query = query.sort({ createdAt: -1 });
          break;
        case 'popular':
          query = query.sort({ views: -1 });
          break;
        case 'rating':
          query = query.sort({ 'ratings.average': -1 });
          break;
        default:
          query = query.sort({ createdAt: -1 });
      }
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // 6) Parallel Execution of Pagination & Lean Product Fetching
    const skip = (Number(page) - 1) * Number(limit);
    
    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      query.skip(skip).limit(Number(limit)).lean()
    ]);

    const pages = Math.ceil(total / Number(limit));

    return {
      products,
      total,
      page: Number(page),
      pages
    };
  }

  static async getSearchSuggestions(searchQuery: string) {
    if (!searchQuery) return [];

    // Return title, slug and images for quick suggestion listing
    return Product.find(
      {
        $or: [
          { title: { $regex: searchQuery, $options: 'i' } },
          { sku: { $regex: searchQuery, $options: 'i' } }
        ],
        isActive: true
      },
      { title: 1, slug: 1, productImages: 1, price: 1, salePrice: 1 }
    ).limit(8);
  }
}
