import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { BD_LOCATIONS_BY_DIVISION, ALL_BD_DISTRICTS, BDDistrict, BDThana } from './data/bd-locations.data';
import { DeliveryZone, IDeliveryZone } from '../src/models/delivery.model';

// Load environment variables (.env)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Force public DNS to avoid local resolution problems with MongoDB Atlas SRV
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore DNS set server error if not supported
}

const MONGO_URI = process.env.MONGO_URI || '';
const SHIPPING_INSIDE_DHAKA = Number(process.env.SHIPPING_CHARGE_INSIDE_DHAKA) || 60;
const SHIPPING_OUTSIDE_DHAKA = Number(process.env.SHIPPING_CHARGE_OUTSIDE_DHAKA) || 120;

// Command line flag: default is dry-run unless --apply is passed
const isApply = process.argv.includes('--apply');
const isDryRun = !isApply;

/** Normalizes a location string for loose matching */
function normalizeString(val: string): string {
  if (!val) return '';
  return val
    .toLowerCase()
    .replace(/[\(\)\[\]\{\}\-\_\,\.\/\\\|\s]+/g, '')
    .trim();
}

/** Extracts English and Bangla components from format like "Dhaka(ঢাকা)" or plain "Dhaka" */
function extractTokens(val: string): string[] {
  if (!val) return [];
  const tokens: string[] = [];
  const normalizedFull = normalizeString(val);
  if (normalizedFull) tokens.push(normalizedFull);

  // Extract content inside parentheses: e.g. "ঢাকা" from "Dhaka(ঢাকা)"
  const matchParen = val.match(/\(([^)]+)\)/);
  if (matchParen && matchParen[1]) {
    const pNorm = normalizeString(matchParen[1]);
    if (pNorm && !tokens.includes(pNorm)) tokens.push(pNorm);
  }

  // Extract content before parentheses: e.g. "Dhaka" from "Dhaka(ঢাকা)"
  const beforeParen = val.replace(/\([^)]*\)/g, '').trim();
  if (beforeParen) {
    const bNorm = normalizeString(beforeParen);
    if (bNorm && !tokens.includes(bNorm)) tokens.push(bNorm);
  }

  return tokens;
}

/** Determines if an existing DB district matches a target dataset district */
function isDistrictMatch(existingDistrictName: string, target: BDDistrict): boolean {
  const existingTokens = extractTokens(existingDistrictName);
  const targetTokens = [
    normalizeString(target.district),
    normalizeString(target.nameEn),
    normalizeString(target.nameBn),
  ].filter(Boolean);

  for (const eTok of existingTokens) {
    for (const tTok of targetTokens) {
      if (eTok === tTok) return true;
    }
  }
  return false;
}

/** Compares two thana arrays for equality */
function areThanasEqual(a: BDThana[] = [], b: any[] = []): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a.map(t => `${normalizeString(t.nameEn)}_${normalizeString(t.nameBn)}`));
  for (const tb of b) {
    const key = `${normalizeString(tb.nameEn)}_${normalizeString(tb.nameBn)}`;
    if (!setA.has(key)) return false;
  }
  return true;
}

async function run() {
  console.log('\n======================================================');
  console.log('       BD LOCATIONS & DELIVERY ZONES SEEDER           ');
  console.log('======================================================');
  console.log(`Mode: ${isApply ? '🔥 APPLY (Writing to MongoDB)' : '🧪 DRY-RUN (Preview only, no changes will be made)'}`);
  console.log(`Target Dataset: ${ALL_BD_DISTRICTS.length} Districts across ${BD_LOCATIONS_BY_DIVISION.length} Divisions`);

  if (!MONGO_URI) {
    console.error('\n❌ ERROR: MONGO_URI is not defined in .env file!');
    process.exit(1);
  }

  if (isApply) {
    console.log('\n⚠️  SAFETY NOTICE - RECOMMENDED DATABASE BACKUP:');
    console.log('   Before proceeding with bulk updates, ensure you have a backup:');
    console.log(`   mongodump --uri="${MONGO_URI.replace(/:([^@]+)@/, ':****@')}" --collection=deliveryzones --out=./db_backup_locations\n`);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log(`✔ Connected to database: ${mongoose.connection.name} (${mongoose.connection.host})\n`);

  try {
    // 1. Fetch existing delivery zones
    const existingZones = await DeliveryZone.find().lean();
    console.log(`📊 Found ${existingZones.length} existing record(s) in "deliveryzones" collection.`);

    const matchedExistingIds = new Set<string>();
    const toInsert: BDDistrict[] = [];
    const toUpdate: { existing: any; target: BDDistrict }[] = [];
    const toSkip: { existing: any; target: BDDistrict }[] = [];

    // 2. Classify each dataset district against existing records
    for (const target of ALL_BD_DISTRICTS) {
      const match = existingZones.find(ez => isDistrictMatch(ez.district, target));

      if (match) {
        matchedExistingIds.add(match._id.toString());
        const thanasMatch = areThanasEqual(target.thanas, match.thanas || []);
        const divisionMatch = match.division === target.division;
        const nameEnMatch = match.nameEn === target.nameEn;
        const nameBnMatch = match.nameBn === target.nameBn;

        if (!thanasMatch || !divisionMatch || !nameEnMatch || !nameBnMatch) {
          toUpdate.push({ existing: match, target });
        } else {
          toSkip.push({ existing: match, target });
        }
      } else {
        toInsert.push(target);
      }
    }

    // 3. Identify any existing records that are not in our 64 district dataset
    const unrecognizedExisting = existingZones.filter(ez => !matchedExistingIds.has(ez._id.toString()));

    // 4. Print detailed classification plan
    console.log('\n----------------- EXECUTION PLAN -----------------');
    console.log(`➕ To Insert: ${toInsert.length} district(s)`);
    console.log(`🔄 To Update: ${toUpdate.length} district(s) (updating thanas / bilingual fields, preserving charges)`);
    console.log(`⏭️  To Skip:   ${toSkip.length} district(s) (already up-to-date)`);
    console.log(`❓ Unrecognized in DB: ${unrecognizedExisting.length} record(s) (will remain untouched)`);
    console.log('--------------------------------------------------\n');

    if (unrecognizedExisting.length > 0) {
      console.log('ℹ️  Unrecognized Existing Records (Kept Intact):');
      unrecognizedExisting.forEach(ue => {
        console.log(`   • ${ue.district} (ID: ${ue._id}, Charge: ${ue.shippingCharge} BDT)`);
      });
      console.log();
    }

    if (toInsert.length > 0) {
      console.log('➕ Districts to be Inserted:');
      toInsert.forEach(d => {
        const defaultCharge = d.isDhaka ? SHIPPING_INSIDE_DHAKA : SHIPPING_OUTSIDE_DHAKA;
        console.log(`   • [${d.division}] ${d.district} (En: ${d.nameEn}, Bn: ${d.nameBn}) -> ${d.thanas.length} thanas, Charge: ${defaultCharge} BDT`);
      });
      console.log();
    }

    if (toUpdate.length > 0) {
      console.log('🔄 Districts to be Updated (Preserving _id & Custom Shipping Charge):');
      toUpdate.forEach(({ existing, target }) => {
        console.log(`   • ${existing.district} (En: ${target.nameEn}, Bn: ${target.nameBn}, Charge: ${existing.shippingCharge} BDT, thanas: ${target.thanas.length})`);
      });
      console.log();
    }

    // 5. Execution or Dry-Run exit
    if (isDryRun) {
      console.log('🧪 DRY-RUN COMPLETED: No changes were written to the database.');
      console.log('👉 To apply these changes, run:');
      console.log('   npm run seed:locations -- --apply\n');
      return;
    }

    // 6. APPLY CHANGES VIA SAFE BULKWRITE
    console.log('🚀 Applying changes to MongoDB...');
    const bulkOps: any[] = [];

    // Operations for Inserts: use $setOnInsert for defaults so nothing is overwritten
    for (const d of toInsert) {
      const defaultCharge = d.isDhaka ? SHIPPING_INSIDE_DHAKA : SHIPPING_OUTSIDE_DHAKA;
      const defaultDeliveryTime = d.isDhaka ? '1-2 Days' : '3-5 Days';

      bulkOps.push({
        updateOne: {
          filter: { district: d.district },
          update: {
            $set: {
              nameEn: d.nameEn,
              nameBn: d.nameBn,
              division: d.division,
              divisionEn: d.divisionEn || d.division,
              divisionBn: d.divisionBn || '',
              thanas: d.thanas,
            },
            $setOnInsert: {
              district: d.district,
              shippingCharge: defaultCharge,
              estimatedDeliveryTime: defaultDeliveryTime,
              courierName: 'Default Courier',
              codAvailable: true,
              isActive: true,
            }
          },
          upsert: true
        }
      });
    }

    // Operations for Updates: match on exact existing _id, update bilingual names, division and thanas
    for (const { existing, target } of toUpdate) {
      bulkOps.push({
        updateOne: {
          filter: { _id: existing._id },
          update: {
            $set: {
              nameEn: target.nameEn,
              nameBn: target.nameBn,
              division: target.division,
              divisionEn: target.divisionEn || target.division,
              divisionBn: target.divisionBn || '',
              thanas: target.thanas,
            }
          }
        }
      });
    }

    if (bulkOps.length > 0) {
      const batchSize = 50;
      let processed = 0;
      for (let i = 0; i < bulkOps.length; i += batchSize) {
        const batch = bulkOps.slice(i, i + batchSize);
        const res = await DeliveryZone.bulkWrite(batch, { ordered: true });
        processed += batch.length;
        console.log(`   ✔ Batch processed: ${processed}/${bulkOps.length} ops (upserted: ${res.upsertedCount}, modified: ${res.modifiedCount})`);
      }
    } else {
      console.log('✔ No database writes needed.');
    }

    // 7. POST-APPLY VERIFICATION
    console.log('\n======================================================');
    console.log('             POST-APPLY VERIFICATION                 ');
    console.log('======================================================');

    const finalZones = await DeliveryZone.find().lean();
    console.log(`1. Total Districts in Database: ${finalZones.length} (Expected >= 64)`);

    let hasErrors = false;

    if (finalZones.length < 64) {
      console.warn(`⚠️ Warning: Expected at least 64 districts, found ${finalZones.length}.`);
      hasErrors = true;
    } else {
      console.log('   ✔ All 64 Districts are present.');
    }

    // Check for duplicate district names
    const nameMap = new Map<string, number>();
    for (const z of finalZones) {
      const norm = normalizeString(z.district);
      nameMap.set(norm, (nameMap.get(norm) || 0) + 1);
    }
    const duplicateDistricts = Array.from(nameMap.entries()).filter(([_, count]) => count > 1);
    if (duplicateDistricts.length > 0) {
      console.error(`❌ Duplicate district names detected:`, duplicateDistricts);
      hasErrors = true;
    } else {
      console.log('   ✔ No duplicate district entries found.');
    }

    // Check each district's thana count and duplicate thanas
    let districtsWithZeroThanas = 0;
    let duplicateThanaPairs = 0;
    let totalThanasAcrossDb = 0;

    for (const z of finalZones) {
      const thanas = z.thanas || [];
      totalThanasAcrossDb += thanas.length;

      if (thanas.length === 0) {
        console.warn(`   ⚠️ District "${z.district}" has 0 thanas!`);
        districtsWithZeroThanas++;
        hasErrors = true;
      }

      const thanaSet = new Set<string>();
      for (const t of thanas) {
        const key = `${normalizeString(t.nameEn)}_${normalizeString(t.nameBn)}`;
        if (thanaSet.has(key)) {
          console.warn(`   ⚠️ Duplicate thana "${t.nameEn} / ${t.nameBn}" in district "${z.district}"`);
          duplicateThanaPairs++;
          hasErrors = true;
        }
        thanaSet.add(key);
      }
    }

    console.log(`2. Total Thanas / Upazilas across all districts: ${totalThanasAcrossDb}`);
    if (districtsWithZeroThanas === 0) {
      console.log('   ✔ Every district has at least one thana.');
    }
    if (duplicateThanaPairs === 0) {
      console.log('   ✔ No duplicate thanas within any district.');
    }

    if (!hasErrors) {
      console.log('\n🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
    } else {
      console.log('\n⚠️ Completed with verification warnings above.');
    }

  } catch (error: any) {
    console.error('\n❌ Critical Error during location seeding:', error);
    process.exit(1);
  } finally {
    console.log('\n🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✔ Disconnected cleanly.\n');
  }
}

run();
