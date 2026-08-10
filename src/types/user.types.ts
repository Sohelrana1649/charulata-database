import { Document, Model, Types } from 'mongoose';

export interface ISavedAddress {
  _id?: Types.ObjectId;
  addressType: 'home' | 'work' | 'other';
  recipientName: string;
  recipientPhone: string;
  district: string;
  addressLine: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'customer' | 'admin' | 'staff' | 'super_admin';
  isGuest: boolean;
  isVerified: boolean;
  isPhoneVerified?: boolean;
  active: boolean;
  otp?: {
    code: string;
    expiresAt: Date;
  };
  savedAddresses: ISavedAddress[];
  profileImage?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

export type UserModel = Model<IUser, {}, IUserMethods>;
