import { User } from '../models/user.model';
import { Wishlist } from '../models/wishlist.model';
import { AppError } from '../utils/appError';
import { Types } from 'mongoose';
import { uploadBase64ToCloudinary } from '../utils/cloudinary';

export class UserService {
  static async addAddress(userId: string, addressData: any) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (addressData.isDefault) {
      user.savedAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.savedAddresses.push(addressData);
    await user.save();
    return user.savedAddresses;
  }

  static async updateAddress(userId: string, addressId: string, addressData: any) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const addressIndex = user.savedAddresses.findIndex(
      (addr) => addr._id?.toString() === addressId
    );

    if (addressIndex === -1) throw new AppError('Address not found', 404);

    if (addressData.isDefault) {
      user.savedAddresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.savedAddresses[addressIndex] = {
      ...(user.savedAddresses[addressIndex] as any).toObject(),
      ...addressData
    };

    await user.save();
    return user.savedAddresses;
  }

  static async deleteAddress(userId: string, addressId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.savedAddresses = user.savedAddresses.filter(
      (addr) => addr._id?.toString() !== addressId
    );

    await user.save();
    return user.savedAddresses;
  }

  static async getWishlist(userId: string) {
    let wishlist = await Wishlist.findOne({ customer: userId }).populate('products');
    if (!wishlist) {
      wishlist = await Wishlist.create({ customer: userId, products: [] });
    }
    // Filter out any products that might have been deleted from the DB (populated as null)
    return (wishlist.products || []).filter(p => p !== null);
  }

  static async addToWishlist(userId: string, productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError('Invalid product ID format', 400);
    }

    let wishlist = await Wishlist.findOne({ customer: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ customer: userId, products: [] });
    }

    const prodIdObj = new Types.ObjectId(productId);
    if (!wishlist.products.some((id) => id.toString() === productId)) {
      wishlist.products.push(prodIdObj);
      await wishlist.save();
    }

    const populated = await wishlist.populate('products');
    if (populated.products) {
      populated.products = populated.products.filter(p => p !== null);
    }
    return populated;
  }

  static async removeFromWishlist(userId: string, productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError('Invalid product ID format', 400);
    }

    let wishlist = await Wishlist.findOne({ customer: userId });
    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();
    
    const populated = await wishlist.populate('products');
    if (populated.products) {
      populated.products = populated.products.filter(p => p !== null);
    }
    return populated;
  }

  static async updateProfile(userId: string, profileData: { name?: string; phone?: string; profileImage?: string; gender?: 'male' | 'female' | 'other'; dateOfBirth?: Date }) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (profileData.name !== undefined) user.name = profileData.name;
    if (profileData.phone !== undefined) user.phone = profileData.phone;
    if (profileData.profileImage !== undefined) {
      if (profileData.profileImage.startsWith('data:image')) {
        user.profileImage = await uploadBase64ToCloudinary(profileData.profileImage, 'charulata_profiles');
      } else {
        user.profileImage = profileData.profileImage;
      }
    }
    if (profileData.gender !== undefined) user.gender = profileData.gender;
    if (profileData.dateOfBirth !== undefined) user.dateOfBirth = profileData.dateOfBirth;

    await user.save();
    return user;
  }

  static async changePassword(userId: string, data: any) {
    const { currentPassword, newPassword } = data;
    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    const user = await User.findById(userId).select('+password');
    if (!user) throw new AppError('User not found', 404);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    user.password = newPassword;
    await user.save();
    return { message: 'Password changed successfully' };
  }

  static async getAllUsersAdmin() {
    return User.find().sort({ role: 1, createdAt: -1 });
  }

  static async updateUserRoleAdmin(operatorUser: any, targetUserId: string, newRole: string) {
    if (operatorUser._id.toString() === targetUserId) {
      throw new AppError('You cannot change your own role.', 400);
    }

    const roleRanks: Record<string, number> = {
      super_admin: 4,
      admin: 3,
      staff: 2,
      customer: 1
    };

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new AppError('User not found', 404);
    }

    const operatorRole = operatorUser.role;
    const operatorRank = roleRanks[operatorRole] || 1;
    const targetRank = roleRanks[targetUser.role] || 1;
    const newRoleRank = roleRanks[newRole] || 1;

    // Permissions check
    if (operatorRole !== 'super_admin') {
      if (operatorRank <= targetRank) {
        throw new AppError('You do not have permission to modify a user with equal or higher rank.', 403);
      }
      if (operatorRank <= newRoleRank) {
        throw new AppError('You cannot assign a role that is equal to or higher than your own.', 403);
      }
    }

    targetUser.role = newRole as any;
    await targetUser.save();
    return targetUser;
  }
}
