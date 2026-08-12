import { Attribute } from '../models/attribute.model';
import { AppError } from '../utils/appError';

export class AttributeService {
  static async getAllAttributes() {
    return Attribute.find().sort({ name: 1 });
  }

  static async createAttribute(data: any) {
    const existing = await Attribute.findOne({
      name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') }
    });
    if (existing) {
      throw new AppError('Attribute with this name already exists', 400);
    }

    return Attribute.create(data);
  }

  static async updateAttribute(id: string, data: any) {
    if (data.name) {
      const existing = await Attribute.findOne({
        name: { $regex: new RegExp(`^${data.name.trim()}$`, 'i') },
        _id: { $ne: id }
      });
      if (existing) {
        throw new AppError('Another attribute with this name already exists', 400);
      }
    }

    const attribute = await Attribute.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
    if (!attribute) throw new AppError('Attribute not found', 404);
    return attribute;
  }

  static async addValue(id: string, value: string) {
    const attribute = await Attribute.findById(id);
    if (!attribute) throw new AppError('Attribute not found', 404);

    if (attribute.values.includes(value)) {
      throw new AppError('Value already exists in this attribute', 400);
    }

    attribute.values.push(value);
    await attribute.save();
    return attribute;
  }

  static async removeValue(id: string, value: string) {
    const attribute = await Attribute.findById(id);
    if (!attribute) throw new AppError('Attribute not found', 404);

    const idx = attribute.values.indexOf(value);
    if (idx === -1) {
      throw new AppError('Value not found in this attribute', 404);
    }

    attribute.values.splice(idx, 1);
    await attribute.save();
    return attribute;
  }

  static async deleteAttribute(id: string) {
    const attribute = await Attribute.findByIdAndDelete(id);
    if (!attribute) throw new AppError('Attribute not found', 404);
    return attribute;
  }
}
