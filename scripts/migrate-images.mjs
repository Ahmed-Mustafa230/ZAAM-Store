/**
 * MongoDB migration script: converts legacy string-based image arrays
 * to the new structured object format { public_id, url, secure_url, is_primary }.
 *
 * Usage:
 *   node scripts/migrate-images.mjs
 *
 * Requires MONGODB_URI env var (uses .env.local if present).
 */

import { createRequire } from 'module';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const require = createRequire(import.meta.url);
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/zaam-store';

async function migrate() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('products');

    const cursor = collection.find({
      $expr: { $gt: [{ $size: '$images' }, 0] },
      'images.public_id': { $exists: false },
    });

    let matched = 0;
    let updated = 0;

    for await (const doc of cursor) {
      matched++;

      if (!Array.isArray(doc.images) || doc.images.length === 0) continue;

      const needsMigration = doc.images.some(
        (img) => typeof img === 'string' || !img?.public_id
      );

      if (!needsMigration) continue;

      const newImages = doc.images.map((img, index) => {
        if (img && typeof img === 'object' && img.public_id) {
          return img;
        }
        const url = typeof img === 'string' ? img : '';
        return {
          public_id: url ? `legacy_${doc._id}_${index}` : '',
          url,
          secure_url: url,
          is_primary: index === 0,
        };
      });

      await collection.updateOne(
        { _id: doc._id },
        { $set: { images: newImages } }
      );

      updated++;
      console.log(`  [${updated}] Migrated product ${doc._id} (${doc.name || 'unnamed'})`);
    }

    console.log(`\nDone. Matched ${matched} products with images, migrated ${updated}.`);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
