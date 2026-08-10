import { Cart } from '../models/cart.model';
import { AppError } from '../utils/appError';

export class CartService {
  static async getCart(userId: string) {
    let cart = await Cart.findOne({ customer: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ customer: userId, items: [] });
    }
    return cart;
  }

  static async addToCart(userId: string, itemData: any) {
    const { product, quantity, color, size, selectedAttributes } = itemData;
    let cart = await Cart.findOne({ customer: userId });
    if (!cart) {
      cart = await Cart.create({ customer: userId, items: [] });
    }

    // Helper to stringify selectedAttributes for comparison
    const attrString = selectedAttributes ? JSON.stringify(selectedAttributes) : '';

    // Check if same item with same variant already exists
    const existingIndex = cart.items.findIndex((item) => {
      const isSameProduct = item.product.toString() === product;
      const isSameColor = item.color === color;
      const isSameSize = item.size === size;
      const itemAttrMap = item.selectedAttributes
        ? (item.selectedAttributes instanceof Map
            ? Object.fromEntries(item.selectedAttributes)
            : item.selectedAttributes)
        : '';
      const isSameAttrs = JSON.stringify(itemAttrMap) === attrString;
      return isSameProduct && isSameColor && isSameSize && isSameAttrs;
    });

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity || 1;
    } else {
      cart.items.push({ product, quantity: quantity || 1, color, size, selectedAttributes });
    }

    await cart.save();
    return cart.populate('items.product');
  }

  static async updateCartItem(userId: string, itemId: string, quantity: number) {
    const cart = await Cart.findOne({ customer: userId });
    if (!cart) throw new AppError('Cart not found', 404);

    const itemIndex = cart.items.findIndex((item) => (item as any)._id.toString() === itemId);
    if (itemIndex === -1) throw new AppError('Item not found in cart', 404);

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    return cart.populate('items.product');
  }

  static async removeFromCart(userId: string, itemId: string) {
    const cart = await Cart.findOne({ customer: userId });
    if (!cart) throw new AppError('Cart not found', 404);

    cart.items = cart.items.filter((item) => (item as any)._id.toString() !== itemId);
    await cart.save();
    return cart.populate('items.product');
  }

  static async clearCart(userId: string) {
    const cart = await Cart.findOne({ customer: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  }
}
