import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { User } from '../models/user.model';
import { Category } from '../models/category.model';
import { Product } from '../models/product.model';
import { DeliveryZone } from '../models/delivery.model';
import { Coupon } from '../models/coupon.model';
import { Banner } from '../models/banner.model';
import { AdminRole } from '../models/adminRole.model';
import { Order } from '../models/order.model';
import { Review } from '../models/review.model';
import { AnalyticsLog } from '../models/analyticsLog.model';
import { Notification } from '../models/notification.model';

const seedData = async () => {
  try {
    console.log('[SEEDER] Connecting to database...');
    console.log('[SEEDER] Mongo URI loaded from config:', config.mongoUri);
    await mongoose.connect(config.mongoUri);
    console.log('[SEEDER] Connection established. Cleaning collections...');

    // Clean old data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await DeliveryZone.deleteMany({});
    await Coupon.deleteMany({});
    await Banner.deleteMany({});
    await AdminRole.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await AnalyticsLog.deleteMany({});
    await Notification.deleteMany({});

    console.log('[SEEDER] Collections cleaned. Seeding delivery zones...');

    // 1. Seed Delivery Zones (All 64 Districts of Bangladesh)
    const districts = [
      "Bagerhat", "Bandarban", "Barguna", "Barishal", "Bhola", "Bogura", "Brahmanbaria",
      "Chandpur", "Chattogram", "Chuadanga", "Cox's Bazar", "Cumilla", "Dhaka",
      "Dinajpur", "Faridpur", "Feni", "Gaibandha", "Gazipur", "Gopalganj", "Habiganj",
      "Jamalpur", "Jashore", "Jhalokati", "Jhenaidah", "Joypurhat", "Khagrachhari",
      "Khulna", "Kishoreganj", "Kurigram", "Kushtia", "Lakshmipur", "Lalmonirhat",
      "Madaripur", "Magura", "Manikganj", "Meherpur", "Moulvibazar", "Munshiganj",
      "Mymensingh", "Naogaon", "Narail", "Narayanganj", "Narsingdi", "Natore",
      "Netrokona", "Nilphamari", "Noakhali", "Pabna", "Panchagarh", "Patuakhali",
      "Pirojpur", "Rajbari", "Rajshahi", "Rangamati", "Rangpur", "Satkhira",
      "Shariatpur", "Sherpur", "Sirajganj", "Sunamganj", "Sylhet", "Tangail",
      "Thakurgaon", "Chapainawabganj"
    ];

    for (const district of districts) {
      const isDhaka = district === 'Dhaka';
      await DeliveryZone.create({
        district,
        shippingCharge: isDhaka ? 60 : 120,
        estimatedDeliveryTime: isDhaka ? '1-2 Days' : '3-5 Days',
        codAvailable: true,
        isActive: true
      });
    }

    // 2. Seed Admin Roles
    await AdminRole.create({
      name: 'Super Admin',
      permissions: ['manage_products', 'manage_orders', 'view_analytics', 'manage_users', 'manage_roles']
    });

    await AdminRole.create({
      name: 'Manager',
      permissions: ['manage_products', 'manage_orders', 'view_analytics']
    });

    // 3. Seed Users (Admin, Staff, Customer)
    const admin = await User.create({
      name: 'Hamim Owner',
      email: 'hamim@gmail.com',
      phone: '01711223344',
      password: '78788787',
      role: 'admin',
      isVerified: true
    });

    const staff = await User.create({
      name: 'Staff Member',
      email: 'staff@charulata.com',
      phone: '01711223355',
      password: 'admin123',
      role: 'staff',
      isVerified: true
    });

    const customer = await User.create({
      name: 'Rahim Ahmed',
      email: 'customer@gmail.com',
      phone: '01811223344',
      password: 'customer123',
      role: 'customer',
      isVerified: true,
      savedAddresses: [
        {
          addressType: 'home',
          recipientName: 'Rahim Ahmed',
          recipientPhone: '01811223344',
          district: 'Dhaka',
          addressLine: 'House 45, Road 12, Dhanmondi',
          isDefault: true
        }
      ]
    });

    console.log('[SEEDER] Users seeded. Seeding categories...');

    // 4. Seed Categories
    const sharees = await Category.create({
      name: 'Jamdani & Silk Sarees',
      slug: 'saree',
      description: 'Authentic handwoven Jamdani and premium silk sarees',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'
    });

    const kurtis = await Category.create({
      name: 'Designer Kurtis',
      slug: 'designer-kurtis',
      description: 'Elegant cotton and silk kurtis for women',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=400'
    });

    const panjabis = await Category.create({
      name: 'Premium Panjabis',
      slug: 'panjabi',
      description: 'Traditional Punjabi wear for men',
      image: 'https://res.cloudinary.com/dau8sazoh/image/upload/v1781684539/download_4_liieog.jpg'
    });

    const jewelry = await Category.create({
      name: 'Premium Jewelry',
      slug: 'jewelry',
      description: 'Stunning handcrafted jewelry sets and ornaments',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400'
    });

    const beauty = await Category.create({
      name: 'Beauty & Attar',
      slug: 'beauty',
      description: 'Exquisite attar perfumes and natural beauty wellness products',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400'
    });

    const gadgets = await Category.create({
      name: 'Modern Gadgets',
      slug: 'gadgets',
      description: 'High fidelity electronics and smart accessories',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400'
    });

    console.log('[SEEDER] Categories seeded. Seeding products...');

    // 5. Seed Products
    const prod1 = await Product.create({
      title: 'Premium Handloom Jamdani Sharee',
      slug: 'premium-handloom-jamdani-sharee',
      description: 'Exquisite 84 count authentic Dhakai Jamdani sharee featuring traditional geometric motifs.',
      sku: 'JAM-001',
      price: 12500,
      salePrice: 10500,
      category: sharees._id as mongoose.Types.ObjectId,
      stockQuantity: 12,
      productImages: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c'],
      tags: ['jamdani', 'sharee', 'wedding', 'eid'],
      isActive: true,
      variants: [
        { color: 'Royal Blue', size: 'Standard', stockQuantity: 5, price: 0 },
        { color: 'Crimson Red', size: 'Standard', stockQuantity: 7, price: 500 }
      ],
      ratings: { average: 4.8, count: 5 },
      views: 230
    });

    const prod2 = await Product.create({
      title: 'Traditional Pure Cotton Panjabi',
      slug: 'traditional-pure-cotton-panjabi',
      description: 'Breathable organic cotton Panjabi with exquisite embroidery on neck and sleeves.',
      sku: 'PAN-012',
      price: 2450,
      category: panjabis._id as mongoose.Types.ObjectId,
      stockQuantity: 25,
      productImages: ['https://images.unsplash.com/photo-1597983073453-ef90a766f1ff'],
      tags: ['cotton', 'panjabi', 'menswear', 'eid'],
      isActive: true,
      variants: [
        { color: 'White', size: 'M', stockQuantity: 8, price: 0 },
        { color: 'White', size: 'L', stockQuantity: 10, price: 0 },
        { color: 'White', size: 'XL', stockQuantity: 7, price: 100 }
      ],
      ratings: { average: 4.5, count: 8 },
      views: 145
    });

    const prod3 = await Product.create({
      title: 'Designer Linen Kurti',
      slug: 'designer-linen-kurti',
      description: 'Asymmetric summer-friendly linen kurti with digital prints.',
      sku: 'KUR-033',
      price: 1800,
      salePrice: 1500,
      category: kurtis._id as mongoose.Types.ObjectId,
      stockQuantity: 3,
      productImages: ['https://images.unsplash.com/photo-1609357605129-26f69add5d6e'],
      tags: ['kurtis', 'linen', 'casual'],
      isActive: true,
      variants: [
        { color: 'Yellow', size: 'S', stockQuantity: 1, price: 0 },
        { color: 'Yellow', size: 'M', stockQuantity: 2, price: 0 }
      ],
      ratings: { average: 4.0, count: 2 },
      views: 78
    });

    // Seed Mock Luxury Products from Frontend UI
    await Product.create({
      title: 'Rajshahi Silk Rose Saree',
      slug: 'rajshahi-silk-rose-saree',
      description: 'Elegant Rajshahi Silk saree featuring delicate rose gold highlights and luxury weave.',
      sku: 'SAR-MOCK-1',
      price: 16800,
      salePrice: 12450,
      category: sharees._id as mongoose.Types.ObjectId,
      stockQuantity: 10,
      productImages: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500'],
      tags: ['silk', 'saree', 'rajshahi', 'rose'],
      isActive: true,
      bestSelling: true,
      newArrival: true,
      flashSale: false,
      badge: 'Bestseller',
      colors: ['#c99a3c', '#d946ef'],
      ratings: { average: 4.9, count: 342 },
      views: 342
    });

    await Product.create({
      title: 'Katan Banarasi Crimson',
      slug: 'katan-banarasi-crimson',
      description: 'Luxurious Banarasi Katan silk saree in radiant crimson with gold brocade motifs.',
      sku: 'SAR-MOCK-2',
      price: 15500,
      salePrice: 13020,
      category: sharees._id as mongoose.Types.ObjectId,
      stockQuantity: 15,
      productImages: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500'],
      tags: ['banarasi', 'saree', 'katan', 'crimson'],
      isActive: true,
      bestSelling: true,
      newArrival: true,
      flashSale: false,
      badge: 'Hot',
      colors: ['#c99a3c', '#e0f2fe'],
      ratings: { average: 4.8, count: 211 },
      views: 450
    });

    await Product.create({
      title: 'Midnight Jamdani Classic',
      slug: 'midnight-jamdani-classic',
      description: 'Classic midnight black Jamdani saree with intricate handloom weaving and gold thread highlights.',
      sku: 'SAR-MOCK-3',
      price: 9450,
      category: sharees._id as mongoose.Types.ObjectId,
      stockQuantity: 8,
      productImages: ['https://images.unsplash.com/photo-1610030470298-40b8bb9a3a4e?w=500'],
      tags: ['jamdani', 'saree', 'midnight', 'black'],
      isActive: true,
      bestSelling: false,
      newArrival: true,
      flashSale: true,
      badge: 'New',
      colors: ['#a855f7', '#d946ef'],
      ratings: { average: 4.7, count: 188 },
      views: 289
    });

    await Product.create({
      title: 'Premium Linen Men Kurta',
      slug: 'premium-linen-men-kurta',
      description: 'Premium organic linen kurta designed for absolute summer comfort and classic styling.',
      sku: 'PAN-MOCK-4',
      price: 4500,
      salePrice: 3800,
      category: panjabis._id as mongoose.Types.ObjectId,
      stockQuantity: 20,
      productImages: ['https://images.unsplash.com/photo-1597983073492-bc24058bd37f?w=500'],
      tags: ['kurta', 'panjabi', 'linen', 'men'],
      isActive: true,
      bestSelling: false,
      newArrival: true,
      flashSale: false,
      badge: 'New',
      colors: ['#10b981', '#ffffff'],
      ratings: { average: 4.6, count: 85 },
      views: 120
    });

    await Product.create({
      title: 'Royal Ivory Panjabi',
      slug: 'royal-ivory-panjabi',
      description: 'Royal ivory traditional Panjabi with premium craftsmanship and subtle neck embroidery.',
      sku: 'PAN-MOCK-5',
      price: 6800,
      category: panjabis._id as mongoose.Types.ObjectId,
      stockQuantity: 14,
      productImages: ['https://images.unsplash.com/photo-1597983073492-bc24058bd37f?w=500'],
      tags: ['panjabi', 'ivory', 'royal', 'men'],
      isActive: true,
      bestSelling: true,
      newArrival: false,
      flashSale: false,
      badge: 'Bestseller',
      colors: ['#ffffff'],
      ratings: { average: 4.8, count: 42 },
      views: 198
    });

    await Product.create({
      title: 'Aurum Gold Choker',
      slug: 'aurum-gold-choker',
      description: 'Stunning 22k gold plated handcrafted choker necklace set from the Maison archive.',
      sku: 'JEW-MOCK-6',
      price: 32000,
      category: jewelry._id as mongoose.Types.ObjectId,
      stockQuantity: 5,
      productImages: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'],
      tags: ['jewelry', 'gold', 'choker', 'necklace'],
      isActive: true,
      bestSelling: true,
      newArrival: false,
      flashSale: false,
      badge: 'Bestseller',
      colors: ['#c99a3c'],
      ratings: { average: 5.0, count: 19 },
      views: 95
    });

    await Product.create({
      title: 'Aurum Gold Necklace Set',
      slug: 'aurum-gold-necklace-set',
      description: 'Signature Aurum gold necklace set with intricate detailing and premium gems for festive elegance.',
      sku: 'JEW-MOCK-7',
      price: 45000,
      salePrice: 39500,
      category: jewelry._id as mongoose.Types.ObjectId,
      stockQuantity: 3,
      productImages: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'],
      tags: ['jewelry', 'gold', 'necklace', 'set'],
      isActive: true,
      bestSelling: true,
      newArrival: false,
      flashSale: false,
      badge: 'Bestseller',
      colors: ['#c99a3c'],
      ratings: { average: 5.0, count: 96 },
      views: 180
    });

    // 6. Seed Coupons
    await Coupon.create({
      code: 'CHARULATA10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 2000,
      maxDiscountAmount: 500,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    });

    await Coupon.create({
      code: 'CODDEAL',
      discountType: 'fixed',
      discountValue: 200,
      minOrderAmount: 1000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    });

await Banner.create({
  title: 'Premium Fashion Collection 2026',
  image: 'https://res.cloudinary.com/dau8sazoh/image/upload/v1781661676/Font_slider_eezplq.jpg',
  link: '/shop',
  isActive: true,
  position: 1
});

await Banner.create({
  title: 'Exclusive Ladies Collection - New Arrival',
  image: 'https://res.cloudinary.com/dau8sazoh/image/upload/v1781661675/Font_slider_diptia.jpg',
  link: '/category/women-fashion',
  isActive: true,
  position: 2
});

await Banner.create({
  title: 'Best Deals & Trending Styles',
  image: 'https://res.cloudinary.com/dau8sazoh/image/upload/v1781661676/Font_slider2_poppa5.jpg',
  link: '/offers',
  isActive: true,
  position: 3
});
    console.log('[SEEDER] Coupons and banners seeded. Generating historical order log...');



    

    // 8. Seed Sample Historical Orders for Analytics (Last 30 days)
    const now = new Date();
    
    // Delivered Order 1 (15 days ago)
    const order1Date = new Date();
    order1Date.setDate(now.getDate() - 15);
    await Order.create({
      orderId: 'ORD-165842831',
      customer: customer._id as mongoose.Types.ObjectId,
      items: [
        {
          product: prod1._id as mongoose.Types.ObjectId,
          price: 10500,
          quantity: 1,
          selectedColor: 'Royal Blue',
          selectedSize: 'Standard'
        }
      ],
      subTotal: 10500,
      shippingCharge: 80,
      discount: 0,
      totalAmount: 10580,
      shippingAddress: {
        recipientName: 'Rahim Ahmed',
        recipientPhone: '01811223344',
        district: 'Dhaka',
        addressLine: 'House 45, Dhanmondi'
      },
      paymentMethod: 'COD',
      paymentStatus: 'Paid',
      deliveryStatus: 'Delivered',
      timeline: [
        { status: 'Pending', title: 'Order Placed', timestamp: new Date(order1Date.getTime()) },
        { status: 'Confirmed', title: 'Order Confirmed', timestamp: new Date(order1Date.getTime() + 3600000) },
        { status: 'Processing', title: 'Processing Order', timestamp: new Date(order1Date.getTime() + 7200000) },
        { status: 'Delivered', title: 'Order Delivered', timestamp: new Date(order1Date.getTime() + 86400000 * 2) }
      ],
      createdAt: order1Date
    });

    // Delivered Order 2 (10 days ago)
    const order2Date = new Date();
    order2Date.setDate(now.getDate() - 10);
    await Order.create({
      orderId: 'ORD-165842999',
      customer: customer._id as mongoose.Types.ObjectId,
      items: [
        {
          product: prod2._id as mongoose.Types.ObjectId,
          price: 2450,
          quantity: 2,
          selectedColor: 'White',
          selectedSize: 'L'
        }
      ],
      subTotal: 4900,
      shippingCharge: 150,
      discount: 200,
      couponCode: 'CODDEAL',
      totalAmount: 4850,
      shippingAddress: {
        recipientName: 'Sayed Ali',
        recipientPhone: '01999888777',
        district: 'Chittagong',
        addressLine: 'Agrabad C/A, Chittagong'
      },
      paymentMethod: 'COD',
      paymentStatus: 'Paid',
      deliveryStatus: 'Delivered',
      timeline: [
        { status: 'Pending', title: 'Order Placed', timestamp: new Date(order2Date.getTime()) },
        { status: 'Delivered', title: 'Order Delivered', timestamp: new Date(order2Date.getTime() + 86400000 * 4) }
      ],
      createdAt: order2Date
    });

    // Cancelled Order (5 days ago)
    const order3Date = new Date();
    order3Date.setDate(now.getDate() - 5);
    await Order.create({
      orderId: 'ORD-165843000',
      customer: customer._id as mongoose.Types.ObjectId,
      items: [
        {
          product: prod3._id as mongoose.Types.ObjectId,
          price: 1500,
          quantity: 1,
          selectedColor: 'Yellow',
          selectedSize: 'S'
        }
      ],
      subTotal: 1500,
      shippingCharge: 80,
      discount: 0,
      totalAmount: 1580,
      shippingAddress: {
        recipientName: 'Rahim Ahmed',
        recipientPhone: '01811223344',
        district: 'Dhaka',
        addressLine: 'House 45, Dhanmondi'
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      deliveryStatus: 'Cancelled',
      timeline: [
        { status: 'Pending', title: 'Order Placed', timestamp: new Date(order3Date.getTime()) },
        { status: 'Cancelled', title: 'Order Cancelled', timestamp: new Date(order3Date.getTime() + 3600000 * 2), description: 'Customer changed mind' }
      ],
      createdAt: order3Date
    });

    // Pending Order (Today)
    await Order.create({
      orderId: 'ORD-999999999',
      customer: customer._id as mongoose.Types.ObjectId,
      items: [
        {
          product: prod2._id as mongoose.Types.ObjectId,
          price: 2450,
          quantity: 1,
          selectedColor: 'White',
          selectedSize: 'M'
        }
      ],
      subTotal: 2450,
      shippingCharge: 80,
      discount: 0,
      totalAmount: 2530,
      shippingAddress: {
        recipientName: 'Rahim Ahmed',
        recipientPhone: '01811223344',
        district: 'Dhaka',
        addressLine: 'House 45, Dhanmondi'
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      deliveryStatus: 'Pending',
      timeline: [
        { status: 'Pending', title: 'Order Placed', timestamp: new Date() }
      ],
      createdAt: new Date()
    });

    // 9. Seed Reviews
    await Review.create({
      product: prod1._id as mongoose.Types.ObjectId,
      customer: customer._id as mongoose.Types.ObjectId,
      rating: 5,
      comment: 'Absolutely stunning Jamdani sharee! The quality is premium and the weave is extremely fine. Highly recommended.',
      status: 'Approved'
    });

    await Review.create({
      product: prod2._id as mongoose.Types.ObjectId,
      customer: customer._id as mongoose.Types.ObjectId,
      rating: 4,
      comment: 'Nice and comfortable Panjabi, perfect for summer Eid wear.',
      status: 'Approved'
    });

    // 10. Seed Analytics Logs for active users calculation
    await AnalyticsLog.create({
      user: customer._id as mongoose.Types.ObjectId,
      eventType: 'UserActivity',
      createdAt: new Date()
    });

    // 11. Seed Notifications
    await Notification.create({
      type: 'NewOrder',
      title: 'New COD Order Received',
      message: 'A new order (CL-20260616-9812) has been placed by a customer. Total BDT 2,530.',
      isRead: false
    });

    await Notification.create({
      type: 'StockAlert',
      title: 'Low Stock Alert',
      message: 'Product "Designer Linen Kurti" (SKU: KUR-033) is running low on stock. Only 3 items remaining.',
      isRead: false
    });

    await Notification.create({
      type: 'UserActivity',
      title: 'New Customer Registered',
      message: 'Customer Rahim Ahmed registered a new account.',
      isRead: true
    });

    console.log('[SEEDER] Database seeded successfully!');
  } catch (error) {
    console.error('[SEEDER] Error seeding database:', error);
  } finally {
    // Wait for any pending async hooks (like review average calculations) to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await mongoose.disconnect();
    console.log('[SEEDER] Disconnected from database.');
  }
};

// Execute if run directly
if (require.main === module) {
  seedData();
}


// await Banner.create({
//   title: 'ঐতিহ্যবাহী জামদানি শাড়ির নতুন কালেকশন',
//   image: 'https://res.cloudinary.com/dau8sazoh/image/upload/v1781661676/Font_slider_eezplq.jpg',
//   link: '/category/jamdani-sharees',
//   isActive: true,
//   position: 1
// });

// await Banner.create({
//   title: 'স্টাইলিশ থ্রি-পিস ও কুর্তি কালেকশন',
//   image: 'https://res.cloudinary.com/dau8sazoh/image/upload/v1781661675/Font_slider_diptia.jpg',
//   link: '/category/three-piece',
//   isActive: true,
//   position: 2
// });

// await Banner.create({
//   title: 'সেরা অফার, দ্রুত ডেলিভারি ও ক্যাশ অন ডেলিভারি',
//   image: 'https://res.cloudinary.com/dau8sazoh/image/upload/v1781661676/Font_slider2_poppa5.jpg',
//   link: '/offers',
//   isActive: true,
//   position: 3
// });