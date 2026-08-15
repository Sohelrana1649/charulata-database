import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Review } from '../models/review.model';

const testFetch = async () => {
  // Force evaluation of User model registration
  console.log('Registered Models:', User.modelName, Product.modelName, Review.modelName);

  await mongoose.connect(config.mongoUri);

  const products = await Product.find({
    title: {
      $in: [
        /Silver Crest RAK-001 Electric Grinder/i,
        /Rechargeable LED Flashlight/i,
        /Halei Premium Ladies Watch/i,
        /3 Pcs Combo Men's Stylish Drop Shoulder/i
      ]
    }
  });

  console.log(`Found ${products.length} products in DB matching target query.`);

  for (const p of products) {
    const reviews = await Review.find({ product: p._id, status: 'Approved' }).populate('customer', 'name');
    console.log(`Product: "${p.title}" (ID: ${p._id})`);
    console.log(` -> DB Ratings: Average=${p.ratings?.average}, Count=${p.ratings?.count}`);
    console.log(` -> Approved Reviews count in DB: ${reviews.length}`);
    if (reviews.length > 0) {
      const cust: any = reviews[0].customer;
      console.log(` -> First Review Sample: ${cust?.name} - "${reviews[0].comment.slice(0, 50)}..."`);
    }
  }

  process.exit(0);
};

testFetch();
