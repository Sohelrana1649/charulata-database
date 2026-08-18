const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://charulata-database:BTh0ADbXeV3VKqLy@cluster0.a6zim2v.mongodb.net/charulata-store?appName=Cluster0";

async function run() {
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas!");
    const db = client.db('charulata-store');
    const products = db.collection('products');

    const p = await products.findOne({ slug: 'iphone-15-pro-max' });
    console.log("Found product:", p?.title, p?._id);

    if (p) {
      // Setup complete PHONE variants for ALL RAM (8GB, 12GB) x Storage (128GB, 256GB, 512GB) x Colors!
      const colors = ["Black", "White", "Blue"];
      const variants = [
        // 8GB RAM + 128GB Storage
        {
          sku: "IPHONE-15-PRO-8GB-128GB-BLACK",
          price: 130000,
          salePrice: 120000,
          stockQuantity: 10,
          color: "Black",
          attributes: { "Color": "Black", "RAM": "8GB", "Storage": "128GB" }
        },
        {
          sku: "IPHONE-15-PRO-8GB-128GB-BLUE",
          price: 130000,
          salePrice: 120000,
          stockQuantity: 10,
          color: "Blue",
          attributes: { "Color": "Blue", "RAM": "8GB", "Storage": "128GB" }
        },
        {
          sku: "IPHONE-15-PRO-8GB-128GB-WHITE",
          price: 130000,
          salePrice: 120000,
          stockQuantity: 10,
          color: "White",
          attributes: { "Color": "White", "RAM": "8GB", "Storage": "128GB" }
        },

        // 8GB RAM + 256GB Storage
        {
          sku: "IPHONE-15-PRO-8GB-256GB-BLACK",
          price: 150000,
          salePrice: 135000,
          stockQuantity: 8,
          color: "Black",
          attributes: { "Color": "Black", "RAM": "8GB", "Storage": "256GB" }
        },
        {
          sku: "IPHONE-15-PRO-8GB-256GB-BLUE",
          price: 150000,
          salePrice: 135000,
          stockQuantity: 8,
          color: "Blue",
          attributes: { "Color": "Blue", "RAM": "8GB", "Storage": "256GB" }
        },
        {
          sku: "IPHONE-15-PRO-8GB-256GB-WHITE",
          price: 150000,
          salePrice: 135000,
          stockQuantity: 8,
          color: "White",
          attributes: { "Color": "White", "RAM": "8GB", "Storage": "256GB" }
        },

        // 8GB RAM + 512GB Storage
        {
          sku: "IPHONE-15-PRO-8GB-512GB-BLACK",
          price: 170000,
          salePrice: 155000,
          stockQuantity: 6,
          color: "Black",
          attributes: { "Color": "Black", "RAM": "8GB", "Storage": "512GB" }
        },
        {
          sku: "IPHONE-15-PRO-8GB-512GB-BLUE",
          price: 170000,
          salePrice: 155000,
          stockQuantity: 6,
          color: "Blue",
          attributes: { "Color": "Blue", "RAM": "8GB", "Storage": "512GB" }
        },
        {
          sku: "IPHONE-15-PRO-8GB-512GB-WHITE",
          price: 170000,
          salePrice: 155000,
          stockQuantity: 6,
          color: "White",
          attributes: { "Color": "White", "RAM": "8GB", "Storage": "512GB" }
        },

        // 12GB RAM + 256GB Storage
        {
          sku: "IPHONE-15-PRO-12GB-256GB-BLACK",
          price: 165000,
          salePrice: 150000,
          stockQuantity: 7,
          color: "Black",
          attributes: { "Color": "Black", "RAM": "12GB", "Storage": "256GB" }
        },
        {
          sku: "IPHONE-15-PRO-12GB-256GB-BLUE",
          price: 165000,
          salePrice: 150000,
          stockQuantity: 7,
          color: "Blue",
          attributes: { "Color": "Blue", "RAM": "12GB", "Storage": "256GB" }
        },
        {
          sku: "IPHONE-15-PRO-12GB-256GB-WHITE",
          price: 165000,
          salePrice: 150000,
          stockQuantity: 7,
          color: "White",
          attributes: { "Color": "White", "RAM": "12GB", "Storage": "256GB" }
        },

        // 12GB RAM + 512GB Storage
        {
          sku: "IPHONE-15-PRO-12GB-512GB-BLACK",
          price: 180000,
          salePrice: 165000,
          stockQuantity: 5,
          color: "Black",
          attributes: { "Color": "Black", "RAM": "12GB", "Storage": "512GB" }
        },
        {
          sku: "IPHONE-15-PRO-12GB-512GB-BLUE",
          price: 180000,
          salePrice: 165000,
          stockQuantity: 5,
          color: "Blue",
          attributes: { "Color": "Blue", "RAM": "12GB", "Storage": "512GB" }
        },
        {
          sku: "IPHONE-15-PRO-12GB-512GB-WHITE",
          price: 180000,
          salePrice: 165000,
          stockQuantity: 5,
          color: "White",
          attributes: { "Color": "White", "RAM": "12GB", "Storage": "512GB" }
        }
      ];

      const attributes = [
        { name: "RAM", options: ["8GB", "12GB"] },
        { name: "Storage", options: ["128GB", "256GB", "512GB"] },
        { name: "Color", options: ["Black", "White", "Blue"] }
      ];

      const res = await products.updateOne(
        { _id: p._id },
        {
          $set: {
            variants,
            attributes,
            colors,
            price: 130000,
            salePrice: 120000
          }
        }
      );

      console.log("Updated iPhone 15 Pro Max variants cleanly with full combinations:", res.modifiedCount);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
