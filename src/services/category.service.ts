import { Category } from '../models/category.model';
import { slugify } from '../utils/slugify';
import { AppError } from '../utils/appError';
import { uploadBase64ToCloudinary } from '../utils/cloudinary';

export class CategoryService {
  static async getAllCategories(query: any) {
    const filter: any = {};
    if (query.activeOnly === 'true') {
      filter.isActive = true;
    }

    if (query.level !== undefined) {
      filter.level = Number(query.level);
    }

    if (query.parentCategory !== undefined) {
      if (query.parentCategory === 'null' || query.parentCategory === '' || query.parentCategory === 'root') {
        filter.parentCategory = null;
      } else {
        filter.parentCategory = query.parentCategory;
      }
    } else if (query.parentSlug) {
      const parent = await Category.findOne({ slug: query.parentSlug });
      if (parent) {
        filter.parentCategory = parent._id;
      } else {
        return [];
      }
    }

    // Return tree structure if requested
    if (query.tree === 'true' || query.hierarchy === 'true') {
      const allFilter = query.activeOnly === 'true' ? { isActive: true } : {};
      const allCategories = await Category.find(allFilter)
        .sort({ order: 1, name: 1 })
        .lean();

      const parentCategories = allCategories.filter(c => !c.parentCategory || c.level === 0);
      const childCategories = allCategories.filter(c => c.parentCategory && c.level !== 0);

      const tree = parentCategories.map(parent => ({
        ...parent,
        subcategories: childCategories.filter(
          child => child.parentCategory?.toString() === parent._id.toString()
        )
      }));

      return tree;
    }

    return Category.find(filter)
      .populate('parentCategory', 'name nameBn slug order level')
      .sort({ order: 1, name: 1 });
  }

  static async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug }).populate('parentCategory', 'name nameBn slug order level');
    if (!category) throw new AppError('Category not found', 404);

    // Fetch immediate child subcategories if any
    const subcategories = await Category.find({ parentCategory: category._id, isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    return {
      ...category.toObject(),
      subcategories
    };
  }

  static async createCategory(data: any) {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new AppError('Category with this name or slug already exists', 400);
    }

    let parentCategoryId = null;
    let level = 0;

    if (data.parentCategory && data.parentCategory !== 'null') {
      let parent = null;
      if (String(data.parentCategory).match(/^[0-9a-fA-F]{24}$/)) {
        parent = await Category.findById(data.parentCategory);
      } else {
        parent = await Category.findOne({ slug: data.parentCategory });
      }

      if (!parent) {
        throw new AppError('Specified parent category does not exist', 400);
      }
      parentCategoryId = parent._id;
      level = (parent.level || 0) + 1;
    }

    let order = Number(data.order);
    if (isNaN(order)) {
      const maxOrderCat = await Category.findOne({ parentCategory: parentCategoryId })
        .sort({ order: -1 })
        .select('order')
        .lean();
      order = maxOrderCat && typeof maxOrderCat.order === 'number' ? maxOrderCat.order + 1 : 1;
    }

    let image = data.image;
    if (image && typeof image === 'string' && image.startsWith('data:image')) {
      image = await uploadBase64ToCloudinary(image, 'charulata_categories');
    }

    return Category.create({
      ...data,
      parentCategory: parentCategoryId,
      level,
      order,
      image,
      slug
    });
  }

  static async updateCategory(id: string, data: any) {
    const updateData = { ...data };
    if (data.slug) { updateData.slug = slugify(data.slug); } else if (data.name) {
      updateData.slug = slugify(data.name);
    }

    if (data.parentCategory !== undefined) {
      if (!data.parentCategory || data.parentCategory === 'null' || data.parentCategory === '') {
        updateData.parentCategory = null;
        updateData.level = 0;
      } else {
        let parent = null;
        if (String(data.parentCategory).match(/^[0-9a-fA-F]{24}$/)) {
          parent = await Category.findById(data.parentCategory);
        } else {
          parent = await Category.findOne({ slug: data.parentCategory });
        }

        if (!parent) {
          throw new AppError('Specified parent category does not exist', 400);
        }
        updateData.parentCategory = parent._id;
        updateData.level = (parent.level || 0) + 1;
      }
    }

    if (updateData.image && typeof updateData.image === 'string' && updateData.image.startsWith('data:image')) {
      updateData.image = await uploadBase64ToCloudinary(updateData.image, 'charulata_categories');
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('parentCategory', 'name nameBn slug order level');
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  static async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  static async getCategoryAttributes(categoryId: string) {
    const category = await Category.findById(categoryId);
    if (!category) throw new AppError('Category not found', 404);
    return category.attributes || [];
  }
}

