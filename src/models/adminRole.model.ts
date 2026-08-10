import { Schema, model, Document } from 'mongoose';

export interface IAdminRole extends Document {
  name: string; // e.g. "SuperAdmin", "SalesManager", "InventoryStaff"
  permissions: string[]; // e.g. ["manage_products", "manage_orders", "view_analytics", "manage_users"]
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const adminRoleSchema = new Schema<IAdminRole>(
  {
    name: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    permissions: [{ type: String, required: true }],
    description: { type: String }
  },
  { timestamps: true }
);

export const AdminRole = model<IAdminRole>('AdminRole', adminRoleSchema);
