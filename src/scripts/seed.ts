import mongoose from 'mongoose';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import * as data from './data';
import { SUBCAT_SPECS, PARENT_SPECS } from './updateCategoryOrders';

// Import all models to register schemas & sync indexes
import '../models/user.model';
import '../models/category.model';
import '../models/product.model';
import '../models/attribute.model';
import '../models/banner.model';
import '../models/settings.model';
import '../models/delivery.model';
import '../models/campaign.model';
import '../models/coupon.model';
import '../models/blog.model';
import '../models/review.model';
import '../models/order.model';
import '../models/subscriber.model';
import '../models/lead.model';
import '../models/wishlist.model';
import '../models/cart.model';
import '../models/notification.model';
import '../models/analyticsLog.model';
import '../models/adminRole.model';
import '../models/contact.model';

// Force public DNS to avoid ISP/local DNS resolution problems with MongoDB SRV
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore DNS set server errors
}

/**
 * Recursively converts plain serialized JSON data back into proper MongoDB BSON types:
 * - 24-hex string IDs -> mongoose.Types.ObjectId
 * - ISO date strings -> Date
 */
function toBson(value: any): any {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(toBson);
  }

  if (typeof value === 'string') {
    // Check if ISO 8601 Date string
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/.test(value)) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    // Check if 24-character hexadecimal ObjectId string
    if (/^[0-9a-fA-F]{24}$/.test(value)) {
      return new mongoose.Types.ObjectId(value);
    }
    return value;
  }

  if (typeof value === 'object' && !(value instanceof mongoose.Types.ObjectId) && !(value instanceof Date)) {
    const res: any = {};
    for (const [k, v] of Object.entries(value)) {
      res[k] = toBson(v);
    }
    return res;
  }

  return value;
}

/**
 * Sanitize Mongo URI to automatically fix unencoded special characters in passwords
 */
function sanitizeMongoUri(uri: string): string {
  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@(.+)$/);
    if (match) {
      const [_, protocol, username, password, rest] = match;
      try {
        decodeURIComponent(password);
        return uri;
      } catch {
        const safePassword = password.replace(/%(?![0-9a-fA-F]{2})/g, '%25');
        return `${protocol}${username}:${safePassword}@${rest}`;
      }
    }
  } catch (e) {}
  return uri;
}

interface CollectionConfig {
  collectionName: string;
  items: any[];
  label: string;
}

async function seedTarget(targetUri: string) {
  const sanitized = sanitizeMongoUri(targetUri);
  console.log(`[SEED] Connecting to: ${sanitized.replace(/:([^:@]+)@/, ':****@')}`);
  await mongoose.connect(sanitized);

  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed: db instance is null');
  }

  const dbName = mongoose.connection.name;
  const host = mongoose.connection.host;
  console.log(`[SEED] Connected successfully!`);
  console.log(`       Host: ${host}`);
  console.log(`       Database: ${dbName}\n`);

  const collections: CollectionConfig[] = [
    { collectionName: 'users', items: data.users || [], label: 'Users' },
    { collectionName: 'categories', items: data.categories || [], label: 'Categories' },
    { collectionName: 'attributes', items: data.attributes || [], label: 'Attributes' },
    { collectionName: 'products', items: data.products || [], label: 'Products' },
    { collectionName: 'banners', items: data.banners || [], label: 'Banners' },
    { collectionName: 'settings', items: data.settings || [], label: 'Settings' },
    { collectionName: 'deliveryzones', items: data.deliveryZones || [], label: 'Delivery Zones' },
    { collectionName: 'campaigns', items: data.campaigns || [], label: 'Campaigns' },
    { collectionName: 'coupons', items: data.coupons || [], label: 'Coupons' },
    { collectionName: 'blogs', items: data.blogs || [], label: 'Blogs' },
    { collectionName: 'reviews', items: data.reviews || [], label: 'Reviews' },
    { collectionName: 'orders', items: data.orders || [], label: 'Orders' },
    { collectionName: 'subscribers', items: data.subscribers || [], label: 'Subscribers' },
    { collectionName: 'leads', items: data.leads || [], label: 'Leads' },
    { collectionName: 'wishlists', items: data.wishlists || [], label: 'Wishlists' },
    { collectionName: 'carts', items: data.carts || [], label: 'Carts' },
    { collectionName: 'notifications', items: data.notifications || [], label: 'Notifications' },
    { collectionName: 'analyticslogs', items: data.analyticsLogs || [], label: 'Analytics Logs' },
  ];

  let totalCollectionsSeeded = 0;
  let totalRecordsInserted = 0;

  for (const { collectionName, items, label } of collections) {
    const col = db.collection(collectionName);

    // 1. Clear existing items
    const deleteResult = await col.deleteMany({});
    const clearedMsg = deleteResult.deletedCount > 0 ? ` (cleared ${deleteResult.deletedCount} old docs)` : '';

    if (!items || items.length === 0) {
      console.log(`   ⏭  ${label.padEnd(16)}: 0 items to seed${clearedMsg}`);
      continue;
    }

    // 2. Convert raw data to BSON types (ObjectIds, Dates)
    const converted = items.map(toBson);

    // 3. Insert in batches of 1000
    const batchSize = 1000;
    let insertedInCollection = 0;

    for (let i = 0; i < converted.length; i += batchSize) {
      const batch = converted.slice(i, i + batchSize);
      await col.insertMany(batch, { ordered: false });
      insertedInCollection += batch.length;
    }

    totalCollectionsSeeded++;
    totalRecordsInserted += insertedInCollection;
    console.log(`   ✔  ${label.padEnd(16)}: ${insertedInCollection.toString().padStart(6)} records inserted${clearedMsg}`);
  }

  // 4. Synchronize indexes
  console.log('\n[SEED] Synchronizing database indexes...');
  try {
    await mongoose.connection.syncIndexes();
    console.log('[SEED] ✔ All collection indexes synchronized.');
  } catch (err: any) {
    console.warn('[SEED] ⚠ Index sync warning:', err?.message || err);
  }

  // 4b. Category & Product Distribution Summary
  try {
    console.log('\n[SEED] ─── Category & Product Distribution Summary ───');
    const catDocs = await db.collection('categories').find({}).toArray();
    const prodDocs = await db.collection('products').find({ isDeleted: { $ne: true } }).toArray();
    const catSlugMap = Object.fromEntries(catDocs.map(c => [c._id.toString(), c.slug]));

    const subcatCounts: Record<string, number> = {};
    for (const s of SUBCAT_SPECS) {
      subcatCounts[s.slug] = 0;
    }
    for (const p of prodDocs) {
      const s = catSlugMap[p.category?.toString()];
      if (s && subcatCounts[s] !== undefined) {
        subcatCounts[s]++;
      }
    }
    for (const [slug, count] of Object.entries(subcatCounts)) {
      const mark = count >= 3 ? '✅' : '⚠️';
      console.log(`       ${mark} ${slug.padEnd(22)}: ${count} products`);
    }
    console.log(`\n[SEED] Total categories: ${catDocs.length} (10 parents, 19 subcategories) | Total products: ${prodDocs.length}`);
  } catch (e: any) {
    console.warn('[SEED] Could not print summary:', e?.message || e);
  }

  console.log(`[SEED] Finished seeding ${dbName}: ${totalRecordsInserted} records in ${totalCollectionsSeeded} collections.`);
  await mongoose.disconnect();
}

async function seed() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('         🚀 CHARULATA DATABASE SEEDER                      ');
  console.log('═══════════════════════════════════════════════════════════\n');

  const rawUri = config.mongoUri || process.env.MONGO_URI;
  if (!rawUri) {
    throw new Error('MONGO_URI is not set in environment or config!');
  }

  await seedTarget(rawUri);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`   ✨ ALL SEEDING COMPLETE!`);
  console.log('═══════════════════════════════════════════════════════════\n');
  process.exit(0);
}

if (require.main === module) {
  seed().catch(async (error) => {
    console.error('\n❌ [SEED ERROR]:', error);
    try {
      await mongoose.disconnect();
    } catch {}
    process.exit(1);
  });
}
