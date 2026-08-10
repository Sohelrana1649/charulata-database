import { Order, DeliveryStatus } from '../models/order.model';
import { Cart } from '../models/cart.model';
import { Product } from '../models/product.model';
import { DeliveryService } from './delivery.service';
import { CouponService } from './coupon.service';
import { Coupon } from '../models/coupon.model';
import { Notification } from '../models/notification.model';
import { AnalyticsLog } from '../models/analyticsLog.model';
import { User } from '../models/user.model';
import { Settings } from '../models/settings.model';
import { AppError } from '../utils/appError';

export class OrderService {
  /**
   * Guest Checkout Flow:
   * -------------------
   * Places an order for unauthenticated users without forcing registration first.
   * 1. Checks if a user already exists with the provided phone number.
   * 2. If user exists AND is registered (isGuest === false) -> links order to that user.
   * 3. If user exists AND is guest (isGuest === true) -> reuses that guest user.
   * 4. If no user exists -> creates a new guest user (isGuest: true, no password).
   * 5. Creates order, deducts stock, triggers alerts, and returns order ID.
   */
  static async guestCheckout(guestCheckoutData: any) {
    const { name, phone, email, shippingAddress, items, couponCode, deliveryNotes, paymentMethod, paymentSenderNumber, transactionId } = guestCheckoutData;

    if (!shippingAddress || !shippingAddress.recipientPhone || !shippingAddress.recipientName || !shippingAddress.district || !shippingAddress.addressLine) {
      throw new AppError('Shipping address details (name, phone, district, address) are required', 400);
    }

    const rawPhone = (shippingAddress.recipientPhone || phone || '').replace(/[\s\-\(\)]/g, '');
    let cleanPhone = rawPhone;
    if (cleanPhone.startsWith('+88')) {
      cleanPhone = cleanPhone.substring(3);
    } else if (cleanPhone.startsWith('88')) {
      cleanPhone = cleanPhone.substring(2);
    }

    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      throw new AppError('Invalid Bangladeshi phone number format', 400);
    }
    const formattedPhone = `+88${cleanPhone}`;

    // 1) Find existing user by phone
    const noLeadingZero = cleanPhone.startsWith('0') ? cleanPhone.substring(1) : cleanPhone;
    let targetUser = await User.findOne({
      $or: [
        { phone: formattedPhone },
        { phone: cleanPhone },
        { phone: `88${cleanPhone}` },
        { phone: noLeadingZero },
        { phone: `+880${noLeadingZero}` }
      ]
    });

    if (!targetUser) {
      // Create new Guest User
      targetUser = await User.create({
        name: shippingAddress.recipientName || name || 'Guest Customer',
        phone: formattedPhone,
        email: email ? email.toLowerCase() : undefined,
        role: 'customer',
        isGuest: true,
        isVerified: true
      });
    } else {
      // Update targetUser name & email if newly provided
      let isModified = false;
      if ((!targetUser.name || targetUser.name === 'Guest Customer') && shippingAddress.recipientName) {
        targetUser.name = shippingAddress.recipientName;
        isModified = true;
      }
      if (!targetUser.email && email) {
        targetUser.email = email.toLowerCase();
        isModified = true;
      }
      if (isModified) await targetUser.save();
    }

    // 2) Items processing
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('No order items provided for guest checkout', 400);
    }

    let subTotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const productId = typeof item.product === 'object' ? item.product._id : item.product;
      const productObj = await Product.findById(productId);
      if (!productObj || !productObj.isActive) {
        throw new AppError(`Product is no longer available`, 400);
      }

      if (productObj.stockQuantity < item.quantity) {
        throw new AppError(`Insufficient stock for product: ${productObj.title}. Only ${productObj.stockQuantity} items left.`, 400);
      }

      const isDiscountExpired = productObj.discountEndDate && new Date() > new Date(productObj.discountEndDate);
      const hasValidSalePrice = !isDiscountExpired &&
        productObj.salePrice !== undefined &&
        productObj.salePrice !== null &&
        Number(productObj.salePrice) > 0 &&
        Number(productObj.salePrice) < Number(productObj.price);

      const unitPrice = hasValidSalePrice ? Number(productObj.salePrice) : Number(productObj.price);

      subTotal += unitPrice * item.quantity;
      orderItems.push({
        product: productObj._id,
        quantity: item.quantity,
        price: unitPrice,
        selectedColor: item.selectedColor || item.color,
        selectedSize: item.selectedSize || item.size,
        selectedAttributes: item.selectedAttributes
      });
    }

    // 3) Calculate delivery charge & coupon
    const deliveryInfo = await DeliveryService.getChargeForDistrict(shippingAddress.district);
    const shippingCharge = deliveryInfo.shippingCharge;

    let discount = 0;
    if (couponCode) {
      const couponVal = await CouponService.validateCoupon(couponCode, subTotal);
      discount = couponVal.discountAmount;
      await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
    }

    const totalAmount = subTotal + shippingCharge - discount;

    // 4) Fetch Current Backend Settings for Advance Payment Rule Enforcement
    const settings = (await Settings.findOne()) || ({} as any);
    const isAdvanceRequired = !!(settings.requireAdvancePayment && (settings.advancePaymentAmount || 0) > 0);
    const rawAdvanceAmount = isAdvanceRequired ? (settings.advancePaymentAmount || 0) : 0;
    const advanceAmount = Math.min(rawAdvanceAmount, totalAmount);
    const remainingAmount = Math.max(0, totalAmount - advanceAmount);

    let finalPaymentMethod: 'COD' | 'bkash' | 'nagad' | 'rocket' = 'COD';
    let finalPaymentNumber: string | undefined = undefined;
    let finalSenderNumber: string | undefined = undefined;
    let finalTransactionId: string | undefined = undefined;
    let finalPaymentStatus: 'Pending' | 'Paid' | 'Not Required' = 'Not Required';

    if (isAdvanceRequired && advanceAmount > 0) {
      finalPaymentStatus = 'Pending';
      const method = (paymentMethod || '').toLowerCase();
      if (method === 'bkash') {
        if (settings.enableBkash === false) throw new AppError('bKash payment method is currently disabled', 400);
        finalPaymentMethod = 'bkash';
        finalPaymentNumber = settings.bkashNumber || settings.paymentPhoneNumber || '01620-556299';
      } else if (method === 'nagad') {
        if (settings.enableNagad === false) throw new AppError('Nagad payment method is currently disabled', 400);
        finalPaymentMethod = 'nagad';
        finalPaymentNumber = settings.nagadNumber || settings.paymentPhoneNumber || '01620-556299';
      } else if (method === 'rocket') {
        if (settings.enableRocket === false) throw new AppError('Rocket payment method is currently disabled', 400);
        finalPaymentMethod = 'rocket';
        finalPaymentNumber = settings.rocketNumber || settings.paymentPhoneNumber || '01620-556299';
      } else {
        throw new AppError('An advance payment method (bKash, Nagad, or Rocket) must be selected', 400);
      }

      if (!paymentSenderNumber || !paymentSenderNumber.trim()) {
        throw new AppError('Sender phone number is required for advance payment', 400);
      }
      if (!transactionId || !transactionId.trim()) {
        throw new AppError('Transaction ID (TrxID) is required for advance payment', 400);
      }

      finalSenderNumber = paymentSenderNumber.trim();
      finalTransactionId = transactionId.trim().toUpperCase();
    } else {
      finalPaymentMethod = 'COD';
      finalPaymentStatus = 'Not Required';
    }

    // Generate Order ID
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `CL-${dateStr}-${randomSuffix}`;

    const daysToAdd = /dhaka/i.test(shippingAddress.district) ? 2 : 4;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + daysToAdd);

    // Create Order with Snapshot
    const order = await Order.create({
      orderId,
      customer: targetUser._id,
      items: orderItems,
      shippingAddress: {
        recipientName: shippingAddress.recipientName,
        recipientPhone: formattedPhone,
        district: shippingAddress.district,
        addressLine: shippingAddress.addressLine
      },
      shippingCharge,
      subTotal,
      discount,
      totalAmount,
      advanceRequired: isAdvanceRequired,
      advanceAmount,
      paymentNumber: finalPaymentNumber,
      remainingAmount,
      couponCode,
      paymentMethod: finalPaymentMethod,
      paymentSenderNumber: finalSenderNumber,
      transactionId: finalTransactionId,
      paymentStatus: finalPaymentStatus,
      deliveryStatus: 'Pending',
      deliveryNotes,
      estimatedDeliveryDate,
      timeline: [
        {
          status: 'Pending',
          title: 'Guest Order Placed',
          description: isAdvanceRequired 
            ? `Your order has been placed with ৳${advanceAmount} advance payment via ${finalPaymentMethod.toUpperCase()}.` 
            : 'Your Cash on Delivery order has been successfully placed via Guest Checkout.',
          timestamp: new Date()
        }
      ]
    });

    // Auto-save shipping address to targetUser profile if not already saved
    try {
      const isDuplicate = (targetUser.savedAddresses || []).some((addr: any) => 
        addr.addressLine?.trim().toLowerCase() === shippingAddress.addressLine?.trim().toLowerCase() &&
        addr.district?.trim().toLowerCase() === shippingAddress.district?.trim().toLowerCase()
      );
      if (!isDuplicate) {
        targetUser.savedAddresses.push({
          addressType: 'home',
          recipientName: shippingAddress.recipientName,
          recipientPhone: formattedPhone,
          district: shippingAddress.district,
          addressLine: shippingAddress.addressLine,
          isDefault: (targetUser.savedAddresses || []).length === 0
        });
        await targetUser.save();
      }
    } catch (saveErr) {
      console.error('Error auto-saving guest address to user profile:', saveErr);
    }

    // Deduct Stock
    for (const item of items) {
      const productId = typeof item.product === 'object' ? item.product._id : item.product;
      const productObj = await Product.findById(productId);
      if (productObj) {
        productObj.stockQuantity -= item.quantity;
        await productObj.save();
      }
    }

    // Alerts & Notifications (Admin Notification)
    await Notification.create({
      type: 'NewOrder',
      title: `New Guest ${finalPaymentMethod.toUpperCase()} Order Received`,
      message: `A new guest order (${orderId}) has been placed by ${shippingAddress.recipientName} (${formattedPhone}). Total BDT ${totalAmount}. Advance: BDT ${advanceAmount}.`,
      metadata: { orderId: order._id, rawId: orderId, totalAmount, advanceAmount, isGuest: true }
    });

    // Customer Order Confirmation Notification
    await Notification.create({
      recipient: targetUser._id,
      type: 'NewOrder',
      title: `Order Placed Successfully (#${orderId})`,
      message: `Your order #${orderId} for BDT ${totalAmount.toLocaleString()} has been placed. We are processing it now!`,
      metadata: { orderId: order._id, rawId: orderId, totalAmount }
    });

    await AnalyticsLog.create({
      eventType: 'CheckoutSuccess',
      user: targetUser._id,
      metadata: { orderId: order._id, rawId: orderId, totalAmount, isGuest: true }
    });

    // Populate product info for frontend order success display
    await order.populate('items.product', 'title productImages salePrice price sku');

    return order;
  }
  static async checkout(userId: string, checkoutData: any) {
    const { shippingAddress, deliveryNotes, couponCode, paymentMethod, paymentSenderNumber, transactionId } = checkoutData;

    // 1) Fetch customer cart
    const cart = await Cart.findOne({ customer: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty', 400);
    }

    // 2) Validate stock and calculate subtotal
    let subTotal = 0;
    const orderItems: any[] = [];

    for (const item of cart.items) {
      const productObj = item.product as any;
      if (!productObj || !productObj.isActive) {
        throw new AppError(`Product is no longer available`, 400);
      }

      // Check stock limit
      if (productObj.stockQuantity < item.quantity) {
        throw new AppError(`Insufficient stock for product: ${productObj.title}. Only ${productObj.stockQuantity} items left.`, 400);
      }

      // If variant was chosen, check variant stock
      if (item.color || item.size) {
        const variant = productObj.variants.find(
          (v: any) =>
            (!item.color || v.color === item.color) &&
            (!item.size || v.size === item.size)
        );
        if (variant && variant.stockQuantity < item.quantity) {
          throw new AppError(`Insufficient stock for variant (${item.color || ''} ${item.size || ''}) of product: ${productObj.title}`, 400);
        }
      }

      // Capture price (salePrice if available and discount has not expired, else standard price)
      const isDiscountExpired = productObj.discountEndDate && new Date() > new Date(productObj.discountEndDate);
      const hasValidSalePrice = !isDiscountExpired &&
        productObj.salePrice !== undefined &&
        productObj.salePrice !== null &&
        Number(productObj.salePrice) > 0 &&
        Number(productObj.salePrice) < Number(productObj.price);

      const unitPrice = hasValidSalePrice ? Number(productObj.salePrice) : Number(productObj.price);

      subTotal += unitPrice * item.quantity;
      orderItems.push({
        product: productObj._id,
        quantity: item.quantity,
        price: unitPrice,
        selectedColor: item.color,
        selectedSize: item.size,
        selectedAttributes: item.selectedAttributes
      });
    }

    // 3) Calculate delivery charge
    const deliveryInfo = await DeliveryService.getChargeForDistrict(shippingAddress.district);
    const shippingCharge = deliveryInfo.shippingCharge;

    // 4) Apply Coupon if exists
    let discount = 0;
    if (couponCode) {
      const couponVal = await CouponService.validateCoupon(couponCode, subTotal);
      discount = couponVal.discountAmount;

      // Update coupon usage count
      await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
    }

    const totalAmount = subTotal + shippingCharge - discount;

    // 5) Fetch Current Backend Settings for Advance Payment Rule Enforcement
    const settings = (await Settings.findOne()) || ({} as any);
    const isAdvanceRequired = !!(settings.requireAdvancePayment && (settings.advancePaymentAmount || 0) > 0);
    const rawAdvanceAmount = isAdvanceRequired ? (settings.advancePaymentAmount || 0) : 0;
    const advanceAmount = Math.min(rawAdvanceAmount, totalAmount);
    const remainingAmount = Math.max(0, totalAmount - advanceAmount);

    let finalPaymentMethod: 'COD' | 'bkash' | 'nagad' | 'rocket' = 'COD';
    let finalPaymentNumber: string | undefined = undefined;
    let finalSenderNumber: string | undefined = undefined;
    let finalTransactionId: string | undefined = undefined;
    let finalPaymentStatus: 'Pending' | 'Paid' | 'Not Required' = 'Not Required';

    if (isAdvanceRequired && advanceAmount > 0) {
      finalPaymentStatus = 'Pending';
      const method = (paymentMethod || '').toLowerCase();
      if (method === 'bkash') {
        if (settings.enableBkash === false) throw new AppError('bKash payment method is currently disabled', 400);
        finalPaymentMethod = 'bkash';
        finalPaymentNumber = settings.bkashNumber || settings.paymentPhoneNumber || '01620-556299';
      } else if (method === 'nagad') {
        if (settings.enableNagad === false) throw new AppError('Nagad payment method is currently disabled', 400);
        finalPaymentMethod = 'nagad';
        finalPaymentNumber = settings.nagadNumber || settings.paymentPhoneNumber || '01620-556299';
      } else if (method === 'rocket') {
        if (settings.enableRocket === false) throw new AppError('Rocket payment method is currently disabled', 400);
        finalPaymentMethod = 'rocket';
        finalPaymentNumber = settings.rocketNumber || settings.paymentPhoneNumber || '01620-556299';
      } else {
        throw new AppError('An advance payment method (bKash, Nagad, or Rocket) must be selected', 400);
      }

      if (!paymentSenderNumber || !paymentSenderNumber.trim()) {
        throw new AppError('Sender phone number is required for advance payment', 400);
      }
      if (!transactionId || !transactionId.trim()) {
        throw new AppError('Transaction ID (TrxID) is required for advance payment', 400);
      }

      finalSenderNumber = paymentSenderNumber.trim();
      finalTransactionId = transactionId.trim().toUpperCase();
    } else {
      finalPaymentMethod = 'COD';
      finalPaymentStatus = 'Not Required';
    }

    // 6) Generate Unique Order ID
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
      (today.getMonth() + 1).toString().padStart(2, '0') +
      today.getDate().toString().padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `CL-${dateStr}-${randomSuffix}`;

    // 7) Calculate Estimated Delivery Date
    const daysToAdd = /dhaka/i.test(shippingAddress.district) ? 2 : 4;
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + daysToAdd);

    // 8) Create Order with Snapshot
    const order = await Order.create({
      orderId,
      customer: userId,
      items: orderItems,
      shippingAddress,
      shippingCharge,
      subTotal,
      discount,
      totalAmount,
      advanceRequired: isAdvanceRequired,
      advanceAmount,
      paymentNumber: finalPaymentNumber,
      remainingAmount,
      couponCode,
      paymentMethod: finalPaymentMethod,
      paymentSenderNumber: finalSenderNumber,
      transactionId: finalTransactionId,
      paymentStatus: finalPaymentStatus,
      deliveryStatus: 'Pending',
      deliveryNotes,
      estimatedDeliveryDate,
      timeline: [
        {
          status: 'Pending',
          title: 'Order Placed',
          description: isAdvanceRequired 
            ? `Your order has been placed with ৳${advanceAmount} advance payment via ${finalPaymentMethod.toUpperCase()}.` 
            : 'Your Cash on Delivery order has been successfully placed.',
          timestamp: new Date()
        }
      ]
    });

    // 8.5) Auto-save shipping address to User profile if not already saved
    try {
      const userDoc = await User.findById(userId);
      if (userDoc) {
        const isDuplicate = (userDoc.savedAddresses || []).some((addr: any) => 
          addr.addressLine?.trim().toLowerCase() === shippingAddress.addressLine?.trim().toLowerCase() &&
          addr.district?.trim().toLowerCase() === shippingAddress.district?.trim().toLowerCase()
        );
        if (!isDuplicate) {
          userDoc.savedAddresses.push({
            addressType: 'home',
            recipientName: shippingAddress.recipientName,
            recipientPhone: shippingAddress.recipientPhone,
            district: shippingAddress.district,
            addressLine: shippingAddress.addressLine,
            isDefault: (userDoc.savedAddresses || []).length === 0
          });
          await userDoc.save();
        }
      }
    } catch (saveErr) {
      console.error('Error auto-saving address to user profile:', saveErr);
    }

    // 9) Deduct Stocks & Check Stock Alerts
    for (const item of cart.items) {
      const productObj = item.product as any;

      // Deduct from overall product stock
      productObj.stockQuantity -= item.quantity;
      
      // Deduct from variant stock if selected
      if (item.color || item.size) {
        const variantIndex = productObj.variants.findIndex(
          (v: any) =>
            (!item.color || v.color === item.color) &&
            (!item.size || v.size === item.size)
        );
        if (variantIndex > -1) {
          productObj.variants[variantIndex].stockQuantity -= item.quantity;
        }
      }

      await productObj.save();

      // Trigger low-stock alert if below threshold (e.g. 5)
      if (productObj.stockQuantity <= 5) {
        await Notification.create({
          type: 'StockAlert',
          title: 'Low Stock Alert',
          message: `Product "${productObj.title}" (SKU: ${productObj.sku}) is running low on stock. Only ${productObj.stockQuantity} items remaining.`,
          metadata: { productId: productObj._id, sku: productObj.sku, stock: productObj.stockQuantity }
        });
      }
    }

    // 9) Create Order Alerts & logs (Admin Notification)
    const isCOD = (paymentMethod || 'COD') === 'COD';
    await Notification.create({
      type: 'NewOrder',
      title: `New ${isCOD ? 'COD' : (paymentMethod || '').toUpperCase()} Order Received`,
      message: `A new order (${orderId}) has been placed by a customer. Total BDT ${totalAmount}.`,
      metadata: { orderId: order._id, rawId: orderId, totalAmount }
    });

    // Customer Order Confirmation Notification
    await Notification.create({
      recipient: userId as any,
      type: 'NewOrder',
      title: `Order Placed Successfully (#${orderId})`,
      message: `Your order #${orderId} for BDT ${totalAmount.toLocaleString()} has been placed. We are processing it now!`,
      metadata: { orderId: order._id, rawId: orderId, totalAmount }
    });

    await AnalyticsLog.create({
      eventType: 'CheckoutSuccess',
      user: userId,
      metadata: { orderId: order._id, rawId: orderId, totalAmount }
    });

    // 10) Clear customer cart
    cart.items = [];
    await cart.save();

    // Populate product info for frontend order success display
    await order.populate('items.product', 'title productImages salePrice price sku');

    return order;
  }

  static async getOrderHistory(userId: string) {
    return Order.find({ customer: userId })
      .populate('items.product')
      .sort({ createdAt: -1 });
  }

  static async getOrderById(id: string, userId: string, role: string) {
    const order = await Order.findById(id).populate('items.product').populate('customer', 'name email phone');
    if (!order) throw new AppError('Order not found', 404);

    // Customers can only see their own orders
    if (role === 'customer' && order.customer._id.toString() !== userId) {
      throw new AppError('You do not have permission to view this order', 403);
    }

    return order;
  }

  static async trackOrder(orderId: string, email: string) {
    const order = await Order.findOne({ orderId })
      .populate('customer')
      .populate('items.product');

    if (!order) {
      throw new AppError('Order not found with the provided Order ID.', 404);
    }

    const customerObj = order.customer as any;
    if (customerObj.email.toLowerCase() !== email.toLowerCase()) {
      throw new AppError('Order ID and Email address do not match.', 400);
    }

    return {
      orderId: order.orderId,
      deliveryStatus: order.deliveryStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      timeline: order.timeline,
      items: order.items.map((item: any) => ({
        title: item.product.title,
        quantity: item.quantity,
        price: item.price,
        color: item.selectedColor,
        size: item.selectedSize
      })),
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress
    };
  }

  static async getAllOrders(queryParams: any) {
    const { status, search, startDate, endDate, page = 1, limit = 10 } = queryParams;
    const filter: any = {};

    if (status) {
      filter.deliveryStatus = status;
    }

    if (search) {
      // Find orders matching Order ID or recipient phone number
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.recipientPhone': { $regex: search, $options: 'i' } },
        { 'shippingAddress.recipientName': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('items.product')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return {
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    };
  }

  static async updateOrderStatus(id: string, status: DeliveryStatus, deliveryNotes?: string) {
    const order = await Order.findById(id);
    if (!order) throw new AppError('Order not found', 404);

    if (order.deliveryStatus === 'Delivered' || order.deliveryStatus === 'Cancelled') {
      throw new AppError(`Cannot update status. Order is already ${order.deliveryStatus.toLowerCase()}`, 400);
    }

    const previousStatus = order.deliveryStatus;
    order.deliveryStatus = status;
    if (deliveryNotes) {
      order.deliveryNotes = deliveryNotes;
    }

    // Set timeline dates and handles stock adjustment if cancelled
    const now = new Date();
    let title = `Order Status: ${status}`;
    let description = `Order delivery status updated to ${status}.`;

    switch (status) {
      case 'Confirmed':
        order.confirmedAt = now;
        title = 'Order Confirmed';
        description = 'Admin has confirmed your Cash on Delivery order.';
        break;
      case 'Processing':
        order.processedAt = now;
        title = 'Processing Order';
        description = 'Your order is being prepared for packaging.';
        break;
      case 'Packed':
        order.packedAt = now;
        title = 'Order Packed';
        description = 'Your items have been safely packed and ready to ship.';
        break;
      case 'Shipped':
        order.shippedAt = now;
        title = 'Order Shipped';
        description = 'Your order has been handed over to the courier partner.';
        break;
      case 'Out for delivery':
        order.outForDeliveryAt = now;
        title = 'Out for Delivery';
        description = 'Our delivery agent is on the way to your shipping address.';
        break;
      case 'Delivered':
        order.deliveredAt = now;
        order.paymentStatus = 'Paid'; // Cash collected upon delivery
        title = 'Order Delivered';
        description = 'Order successfully delivered and payment collected.';
        break;
      case 'Cancelled':
        order.cancelledAt = now;
        title = 'Order Cancelled';
        description = deliveryNotes || 'Order has been cancelled.';

        // Restore Stock
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stockQuantity += item.quantity;
            
            // Restore variant stock
            if (item.selectedColor || item.selectedSize) {
              const variantIndex = product.variants.findIndex(
                (v) =>
                  (!item.selectedColor || v.color === item.selectedColor) &&
                  (!item.selectedSize || v.size === item.selectedSize)
              );
              if (variantIndex > -1) {
                product.variants[variantIndex].stockQuantity += item.quantity;
              }
            }
            await product.save();
          }
        }
        break;
    }

    // Push to timeline
    order.timeline.push({
      status,
      title,
      description,
      timestamp: now
    });

    await order.save();

    // Notify Customer about status change
    await Notification.create({
      recipient: order.customer,
      type: 'General',
      title: `Order Status Update: ${status}`,
      message: `Your order ${order.orderId} status has changed from ${previousStatus} to ${status}.`,
      metadata: { orderId: order._id, rawId: order.orderId, status }
    });

    return order;
  }

  static async bulkUpdateOrderStatus(orderIds: string[], status: DeliveryStatus, deliveryNotes?: string) {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new AppError('No order IDs provided for bulk update', 400);
    }

    const updatedOrders: any[] = [];
    for (const id of orderIds) {
      try {
        const updated = await this.updateOrderStatus(id, status, deliveryNotes);
        updatedOrders.push(updated);
      } catch (err) {
        // Skip orders that are already final (e.g. delivered/cancelled)
      }
    }

    return {
      updatedCount: updatedOrders.length,
      orders: updatedOrders
    };
  }
}
