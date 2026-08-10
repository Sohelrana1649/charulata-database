import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserMethods, UserModel } from '../types/user.types';

const addressSchema = new Schema({
  addressType: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  recipientName: { type: String, required: true },
  recipientPhone: { type: String, required: true },
  district: { type: String, required: true },
  addressLine: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: { type: String, select: false },
    role: { type: String, enum: ['customer', 'admin', 'staff', 'super_admin'], default: 'customer' },
    isGuest: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    otp: {
      code: { type: String },
      expiresAt: { type: Date }
    },
    savedAddresses: [addressSchema],
    profileImage: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: { type: Date },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (this: any) {
  if (!this.isModified('password')) return;
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (this: any, password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password || '');
};

export const User = model<IUser, UserModel>('User', userSchema);
