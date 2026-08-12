/**
 * Seed script: Migrate static attributes config into the database.
 *
 * Reads GLOBAL_ATTRIBUTES and CATEGORY_ATTRIBUTE_MAPPING from
 * src/config/attributes.config.ts, upserts into the Attribute collection,
 * and merges attribute names into each matching Category's attributes field.
 *
 * Run once: npx ts-node src/scripts/seedAttributes.ts
 *   or:     npm run seed:attributes
 */
import mongoose from 'mongoose';
import { config } from '../config';
import { GLOBAL_ATTRIBUTES, CATEGORY_ATTRIBUTE_MAPPING } from '../config/attributes.config';
import { Attribute } from '../models/attribute.model';
import { Category } from '../models/category.model';
import { slugify } from '../utils/slugify';

async function seed() {
  console.log('[SEED] Connecting to MongoDB...');
  await mongoose.connect(config.mongoUri);
  console.log('[SEED] Connected.\n');

  // ── 1) Upsert global attributes ─────────────────────────────────────
  console.log('═══ Seeding Global Attributes ═══');
  let attrCreated = 0;
  let attrUpdated = 0;

  for (const attr of GLOBAL_ATTRIBUTES) {
    const slug = slugify(attr.name);
    const existing = await Attribute.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${attr.name}$`, 'i') } },
        { slug }
      ]
    });

    if (existing) {
      // Merge values — $addToSet avoids duplicates
      await Attribute.updateOne(
        { _id: existing._id },
        { $addToSet: { values: { $each: attr.values } } }
      );
      console.log(`  ✔ Updated attribute "${attr.name}" (merged ${attr.values.length} values)`);
      attrUpdated++;
    } else {
      await Attribute.create({
        name: attr.name,
        slug,
        values: attr.values,
        isActive: true
      });
      console.log(`  ✚ Created attribute "${attr.name}" with ${attr.values.length} values`);
      attrCreated++;
    }
  }

  console.log(`\n  Summary: ${attrCreated} created, ${attrUpdated} updated\n`);

  // ── 2) Map attributes to categories ──────────────────────────────────
  console.log('═══ Mapping Attributes to Categories ═══');
  const matched: string[] = [];
  const unmatched: string[] = [];

  for (const [categoryName, attrNames] of Object.entries(CATEGORY_ATTRIBUTE_MAPPING)) {
    // Case-insensitive find by name or slug
    const catSlug = slugify(categoryName);
    const category = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${categoryName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
        { slug: catSlug }
      ]
    });

    if (category) {
      await Category.updateOne(
        { _id: category._id },
        { $addToSet: { attributes: { $each: attrNames } } }
      );
      console.log(`  ✔ "${categoryName}" → [${attrNames.join(', ')}] (Updated existing category)`);
      matched.push(categoryName);
    } else {
      await Category.create({
        name: categoryName,
        slug: catSlug,
        description: `Category for ${categoryName}`,
        attributes: attrNames,
        isActive: true
      });
      console.log(`  ✚ "${categoryName}" → [${attrNames.join(', ')}] (Auto-created missing category)`);
      matched.push(categoryName);
    }
  }

  // ── 3) Final summary ────────────────────────────────────────────────
  console.log('\n═══ Final Summary ═══');
  console.log(`  Matched categories:   ${matched.length} — ${matched.join(', ') || 'none'}`);
  console.log(`  Unmatched categories: ${unmatched.length} — ${unmatched.join(', ') || 'none'}`);

  if (unmatched.length > 0) {
    console.log('\n  ⚠ Unmatched categories may need manual creation or name correction in the database.');
  }

  console.log('\n[SEED] Done. Disconnecting...');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('[SEED] Fatal error:', err);
  process.exit(1);
});
