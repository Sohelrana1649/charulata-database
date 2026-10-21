/**
 * Database Export Script
 * 
 * Dumps all collections from the currently connected MongoDB database into `src/scripts/data.ts`.
 * Run with: npm run export:data
 */
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dns from 'dns';
import { config } from '../config';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

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

const COLLECTION_MAP: { collection: string; varName: string; label: string }[] = [
  { collection: 'categories', varName: 'categories', label: 'Categories' },
  { collection: 'attributes', varName: 'attributes', label: 'Attributes' },
  { collection: 'products', varName: 'products', label: 'Products' },
  { collection: 'banners', varName: 'banners', label: 'Banners' },
  { collection: 'settings', varName: 'settings', label: 'Settings' },
  { collection: 'deliveryzones', varName: 'deliveryZones', label: 'Delivery Zones' },
  { collection: 'campaigns', varName: 'campaigns', label: 'Campaigns' },
  { collection: 'coupons', varName: 'coupons', label: 'Coupons' },
  { collection: 'blogs', varName: 'blogs', label: 'Blogs' },
  { collection: 'reviews', varName: 'reviews', label: 'Reviews' },
  { collection: 'users', varName: 'users', label: 'Users' },
  { collection: 'orders', varName: 'orders', label: 'Orders' },
  { collection: 'subscribers', varName: 'subscribers', label: 'Subscribers' },
  { collection: 'leads', varName: 'leads', label: 'Leads' },
  { collection: 'wishlists', varName: 'wishlists', label: 'Wishlists' },
  { collection: 'carts', varName: 'carts', label: 'Carts' },
  { collection: 'notifications', varName: 'notifications', label: 'Notifications' },
  { collection: 'analyticslogs', varName: 'analyticsLogs', label: 'Analytics Logs' },
];

export async function exportData() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('         📤 EXPORTING DATABASE TO data.ts                   ');
  console.log('═══════════════════════════════════════════════════════════\n');

  const rawUri = config.mongoUri || process.env.MONGO_URI;
  if (!rawUri) {
    throw new Error('MONGO_URI is not defined!');
  }

  const uri = sanitizeMongoUri(rawUri);
  console.log('[EXPORT] Connecting to MongoDB...');
  await mongoose.connect(uri);

  const db = mongoose.connection.db;
  if (!db) throw new Error('Could not get db handle');

  console.log(`[EXPORT] Connected to ${mongoose.connection.host}/${mongoose.connection.name}\n`);

  let fileContent = `/**\n * Auto-generated seed data exported from database: ${mongoose.connection.name}\n * Exported on: ${new Date().toISOString()}\n */\n\n`;

  let totalRecords = 0;

  for (const item of COLLECTION_MAP) {
    const col = db.collection(item.collection);
    const docs = await col.find({}).toArray();
    console.log(`   ✔ Exported ${item.label.padEnd(16)}: ${docs.length.toString().padStart(6)} records`);

    fileContent += `export const ${item.varName} = ${JSON.stringify(docs, null, 2)};\n\n`;
    totalRecords += docs.length;
  }

  const targetPath = path.join(__dirname, 'data.ts');
  fs.writeFileSync(targetPath, fileContent, 'utf-8');

  const stats = fs.statSync(targetPath);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`   ✨ EXPORT COMPLETE!`);
  console.log(`   Output: ${targetPath}`);
  console.log(`   Total Records: ${totalRecords}`);
  console.log(`   File Size: ${(stats.size / 1024).toFixed(1)} KB`);
  console.log('═══════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

if (require.main === module) {
  exportData().catch(async (err) => {
    console.error('❌ Export failed:', err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(1);
  });
}
