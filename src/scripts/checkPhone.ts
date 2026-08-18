import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://charulata-database:BTh0ADbXeV3VKqLy@cluster0.a6zim2v.mongodb.net/charulata-store?appName=Cluster0';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  if (!db) {
    console.error('No DB connection');
    process.exit(1);
  }

  const productsColl = db.collection('products');
  const product = await productsColl.findOne({ slug: 'iphone-15-pro-max' });

  console.log('Current iPhone 15 Pro Max Product:');
  console.log(JSON.stringify(product, null, 2));

  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
