import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || '';

/**
 * Priority Order for 10 Parents and their Subcategories
 */
export const CATEGORY_PRIORITY_ORDER: Record<string, number> = {
  // 6 Main Parent Categories (Level 0) + Additional Parents
  'womens-fashion': 1,
  'mens-fashion': 2,
  'accessories': 3,
  'modern-gadgets': 4,
  'home-lifestyle': 5,
  'kids-zone': 6,
  'beauty-personal-care': 7,
  'bags-footwear': 8,
  'jewelry-watches': 9,
  'health-fitness': 10,

  // Women's Fashion Subcategories (Level 1)
  'jamdani-silk-sarees': 1,
  'three-piece': 2,
  'kurti': 3,
  'abaya': 4,

  // Men's Fashion Subcategories (Level 1)
  'panjabi': 1,
  'shirt': 2,
  't-shirt': 3,
  'polo-shirt': 4,
  'pant': 5,

  // Accessories Subcategories (Level 1)
  'bag': 1,
  'shoes': 2,
  'watch': 3,
  'sunglasses': 4,
  'premium-jewelry': 5,

  // Home & Lifestyle Subcategories (Level 1)
  'attar': 1,
  'perfume': 2,
  'cleaning': 3,

  // Kids Zone Subcategories (Level 1)
  'kids-boys': 1,
  'kids-girls': 2,
};

export const PARENT_SPECS = [
  { id: '6a7b5eea7874563a19215244', slug: 'womens-fashion', name: "Women's Fashion", nameBn: 'নারীদের ফ্যাশন', order: 1 },
  { id: '6a79e6a7970b44b9d2135313', slug: 'mens-fashion', name: "Men's Fashion", nameBn: 'পুরুষের ফ্যাশন', order: 2 },
  { id: '6a7c47cac962023592b71c51', slug: 'accessories', name: 'Accessories', nameBn: 'এক্সেসরিজ', order: 3 },
  { id: '6a7c47cac962023592b71c4e', slug: 'modern-gadgets', name: 'Modern Gadgets', nameBn: 'আধুনিক গ্যাজেটস', order: 4 },
  { id: '6a7f57262ef7bf752244df0e', slug: 'home-lifestyle', name: 'Home & Lifestyle', nameBn: 'হোম ও লাইফস্টাইল', order: 5 },
  { id: '6a7ebbe21385795729c0466a', slug: 'kids-zone', name: 'Kids Zone', nameBn: 'কিডস', order: 6 },
  { id: '6acd9c465ea4352478736402', slug: 'beauty-personal-care', name: 'Beauty & Personal Care', nameBn: 'বিউটি ও পার্সোনাল কেয়ার', order: 7 },
  { id: '6acd9c465ea4352478736403', slug: 'bags-footwear', name: 'Bags & Footwear', nameBn: 'ব্যাগ ও ফুটওয়্যার', order: 8 },
  { id: '6acd9c465ea4352478736404', slug: 'jewelry-watches', name: 'Jewelry & Watches', nameBn: 'জুয়েলারি ও ঘড়ি', order: 9 },
  { id: '6acd9c465ea4352478736405', slug: 'health-fitness', name: 'Health & Fitness', nameBn: 'হেলথ ও ফিটনেস', order: 10 },
];

export const SUBCAT_SPECS = [
  // Women's Fashion
  { id: '6a7c47cac962023592b71c4d', parentSlug: 'womens-fashion', slug: 'jamdani-silk-sarees', name: 'Jamdani & Silk Sarees', nameBn: 'শাড়ি', attributes: ['Color', 'Length'], order: 1 },
  { id: '6a7c47cac962023592b71c52', parentSlug: 'womens-fashion', slug: 'three-piece', name: 'Three Piece', nameBn: 'থ্রি-পিস', attributes: ['Size', 'Color', 'Material'], order: 2 },
  { id: '6a7c47cac962023592b71c53', parentSlug: 'womens-fashion', slug: 'kurti', name: 'Kurti', nameBn: 'কুর্তি', attributes: ['Size', 'Color'], order: 3 },
  { id: '6a7c47cac962023592b71c54', parentSlug: 'womens-fashion', slug: 'abaya', name: 'Abaya & Borka', nameBn: 'আবায়া', attributes: ['Size', 'Color', 'Length'], order: 4 },

  // Men's Fashion
  { id: '6a7c47cac962023592b71c4b', parentSlug: 'mens-fashion', slug: 'panjabi', name: 'Panjabi', nameBn: 'পাঞ্জাবি', attributes: ['Size', 'Color'], order: 1 },
  { id: '6a7c47cac962023592b71c4a', parentSlug: 'mens-fashion', slug: 'shirt', name: 'Shirt', nameBn: 'শার্ট', attributes: ['Size', 'Color'], order: 2 },
  { id: '6a79dec1b566610e4e25e1e4', parentSlug: 'mens-fashion', slug: 't-shirt', name: 'T-Shirt', nameBn: 'টি-শার্ট', attributes: ['Size', 'Color'], order: 3 },
  { id: '6a957a929fb0ef69fd02ba60', parentSlug: 'mens-fashion', slug: 'polo-shirt', name: 'Polo Shirt', nameBn: 'পোলো শার্ট', attributes: ['Size', 'Color'], order: 4 },
  { id: '6a7c47cac962023592b71c55', parentSlug: 'mens-fashion', slug: 'pant', name: 'Pants', nameBn: 'প্যান্ট', attributes: ['Size', 'Color'], order: 5 },

  // Accessories
  { id: '6a79e5cc970b44b9d21352ff', parentSlug: 'accessories', slug: 'bag', name: 'Bag', nameBn: 'ব্যাগ', attributes: ['Color', 'Material'], order: 1 },
  { id: '6a7c47cac962023592b71c4c', parentSlug: 'accessories', slug: 'shoes', name: 'Shoes', nameBn: 'জুতা', attributes: ['Size', 'Color'], order: 2 },
  { id: '6a7c47cac962023592b71c56', parentSlug: 'accessories', slug: 'watch', name: 'Watch', nameBn: 'ঘড়ি', attributes: ['Color', 'Material'], order: 3 },
  { id: '6a8066a77645ffea700ac479', parentSlug: 'accessories', slug: 'sunglasses', name: 'Sunglasses', nameBn: 'সানগ্লাস', attributes: ['Color'], order: 4 },
  { id: '6a7c47cac962023592b71c4f', parentSlug: 'accessories', slug: 'premium-jewelry', name: 'Premium Jewelry', nameBn: 'প্রিমিয়াম জুয়েলারি', attributes: ['Material', 'Color'], order: 5 },

  // Home & Lifestyle
  { id: '6a7c47cac962023592b71c50', parentSlug: 'home-lifestyle', slug: 'attar', name: 'Attar', nameBn: 'আতর', attributes: ['Volume'], order: 1 },
  { id: '6a7ed9521385795729c0474a', parentSlug: 'home-lifestyle', slug: 'perfume', name: 'Perfume', nameBn: 'পারফিউম', attributes: ['Volume'], order: 2 },
  { id: '6a85b9f39358bfe209e7b6ff', parentSlug: 'home-lifestyle', slug: 'cleaning', name: 'Cleaning', nameBn: 'ক্লিনিং', attributes: ['Weight'], order: 3 },

  // Kids Zone
  { id: '6a7c47cac962023592b71c57', parentSlug: 'kids-zone', slug: 'kids-boys', name: 'Boys Fashion', nameBn: 'ছেলেদের', attributes: ['Size', 'Color', "Year's"], order: 1 },
  { id: '6a7c47cac962023592b71c58', parentSlug: 'kids-zone', slug: 'kids-girls', name: 'Girls Fashion', nameBn: 'মেয়েদের', attributes: ['Size', 'Color', "Year's"], order: 2 },
];

export async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('No DB connection');
    process.exit(1);
  }

  const categoriesColl = db.collection('categories');

  // 1. Upsert Parents
  const parentIdMap: Record<string, mongoose.Types.ObjectId> = {};
  for (const p of PARENT_SPECS) {
    const parentId = new mongoose.Types.ObjectId(p.id);
    parentIdMap[p.slug] = parentId;

    await categoriesColl.updateOne(
      { slug: p.slug },
      {
        $set: {
          name: p.name,
          nameBn: p.nameBn,
          level: 0,
          parentCategory: null,
          order: p.order,
          isActive: true,
          updatedAt: new Date()
        },
        $setOnInsert: {
          _id: parentId,
          attributes: [],
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`Parent updated/created: [${p.name}] (${p.slug}) -> order: ${p.order}`);
  }

  // 2. Upsert Subcategories
  for (const s of SUBCAT_SPECS) {
    const subId = new mongoose.Types.ObjectId(s.id);
    const parentId = parentIdMap[s.parentSlug];

    await categoriesColl.updateOne(
      { slug: s.slug },
      {
        $set: {
          name: s.name,
          nameBn: s.nameBn,
          level: 1,
          parentCategory: parentId,
          order: s.order,
          attributes: s.attributes,
          isActive: true,
          updatedAt: new Date()
        },
        $setOnInsert: {
          _id: subId,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log(`Subcategory updated/created: [${s.name}] (${s.slug}) under ${s.parentSlug} -> order: ${s.order}`);
  }

  console.log('\nAll categories successfully updated with hierarchy and priority order!');
  await mongoose.disconnect();
}

if (require.main === module) {
  run().catch((err) => {
    console.error('Error updating categories:', err);
    process.exit(1);
  });
}
