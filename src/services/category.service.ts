import { Category } from '../models/category.model';
import { slugify } from '../utils/slugify';
import { AppError } from '../utils/appError';
import { uploadBase64ToCloudinary } from '../utils/cloudinary';

export class CategoryService {
  static async getAllCategories(query: any) {
    const filter = query.activeOnly === 'true' ? { isActive: true } : {};
    return Category.find(filter).sort({ name: 1 });
  }

  static async getCategoryBySlug(slug: string) {
    const category = await Category.findOne({ slug });
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  static async createCategory(data: any) {
    const slug = slugify(data.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new AppError('Category with this name or slug already exists', 400);
    }
    let image = data.image;
    if (image && typeof image === 'string' && image.startsWith('data:image')) {
      image = await uploadBase64ToCloudinary(image, 'charulata_categories');
    }
    return Category.create({ ...data, image, slug });
  }

  static async updateCategory(id: string, data: any) {
    const updateData = { ...data };
    if (data.name) {
      updateData.slug = slugify(data.name);
    }
    if (updateData.image && typeof updateData.image === 'string' && updateData.image.startsWith('data:image')) {
      updateData.image = await uploadBase64ToCloudinary(updateData.image, 'charulata_categories');
    }
    const category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }

  static async deleteCategory(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new AppError('Category not found', 404);
    return category;
  }
}
