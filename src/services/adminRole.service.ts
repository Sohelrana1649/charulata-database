import { AdminRole } from '../models/adminRole.model';
import { AppError } from '../utils/appError';

export class AdminRoleService {
  static async createRole(data: any) {
    const existing = await AdminRole.findOne({ name: data.name.toUpperCase() });
    if (existing) throw new AppError('Role name already exists', 400);
    return AdminRole.create({ ...data, name: data.name.toUpperCase() });
  }

  static async getAllRoles() {
    return AdminRole.find().sort({ name: 1 });
  }

  static async updateRole(id: string, data: any) {
    const updateData = { ...data };
    if (data.name) updateData.name = data.name.toUpperCase();

    const role = await AdminRole.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  static async deleteRole(id: string) {
    const role = await AdminRole.findByIdAndDelete(id);
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }
}
