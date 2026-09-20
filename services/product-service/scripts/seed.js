const mongoose = require('mongoose');
const { ProductModel } = require('../dist/models/product-model.js');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meshly_products';

const products = [
  {
    name: 'Aster Wireless Headphones',
    description: 'Balanced wireless headphones with soft memory-foam cushions and a focused listening mode.',
    price: 129,
    sku: 'ELEC-ASTER-HEADPHONES',
    category: 'Electronics',
    inventoryCount: 24,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    isActive: true,
  },
  {
    name: 'Orbit Desk Lamp',
    description: 'A compact, adjustable LED desk lamp with warm-to-cool light for focused work.',
    price: 78,
    sku: 'ELEC-ORBIT-LAMP',
    category: 'Electronics',
    inventoryCount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    isActive: true,
  },
  {
    name: 'Field Canvas Overshirt',
    description: 'A sturdy cotton-canvas overshirt with useful pockets and an easy everyday fit.',
    price: 96,
    sku: 'CLOTH-FIELD-OVERSHIRT',
    category: 'Clothing',
    inventoryCount: 32,
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80',
    isActive: true,
  },
  {
    name: 'Loom Everyday Tote',
    description: 'A durable woven tote with a broad base for books, groceries, and daily essentials.',
    price: 42,
    sku: 'CLOTH-LOOM-TOTE',
    category: 'Clothing',
    inventoryCount: 41,
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=900&q=80',
    isActive: true,
  },
  {
    name: 'Ridge Ceramic Pour-Over',
    description: 'Hand-finished ceramic brewer designed for a calm, consistent morning ritual.',
    price: 36,
    sku: 'HOME-RIDGE-BREWER',
    category: 'Home',
    inventoryCount: 27,
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80',
    isActive: true,
  },
  {
    name: 'Moss Linen Throw',
    description: 'A breathable linen-cotton throw in a muted moss tone for couches and reading corners.',
    price: 84,
    sku: 'HOME-MOSS-THROW',
    category: 'Home',
    inventoryCount: 15,
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80',
    isActive: true,
  },
  {
    name: 'Northline Chef Knife',
    description: 'A balanced stainless-steel chef knife with a comfortable walnut handle.',
    price: 68,
    sku: 'KITCH-NORTHLINE-KNIFE',
    category: 'Kitchen',
    inventoryCount: 20,
    imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&w=900&q=80',
    isActive: true,
  },
  {
    name: 'Everyday Glass Carafe',
    description: 'A clear borosilicate glass carafe with a simple pour spout for the table or fridge.',
    price: 29,
    sku: 'KITCH-GLASS-CARAFE',
    category: 'Kitchen',
    inventoryCount: 36,
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=900&q=80',
    isActive: true,
  },
  {
    name: 'Transit Weekender',
    description: 'A structured recycled-nylon weekender with a padded sleeve and separate shoe compartment.',
    price: 148,
    sku: 'TRAVEL-TRANSIT-WEEKENDER',
    category: 'Travel',
    inventoryCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    isActive: true,
  },
];

async function seed() {
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB at ${mongoUri}`);
  console.log(`Seeding ${products.length} products by SKU (safe to run repeatedly)...`);

  for (const product of products) {
    const existing = await ProductModel.findOne({ sku: product.sku }).lean();
    const saved = await ProductModel.findOneAndUpdate({ sku: product.sku }, product, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();
    console.log(`${existing ? 'Updated' : 'Inserted'}: ${saved.name} | ${saved.sku} | ${saved._id}`);
  }

  console.log(`Seed complete: ${products.length} products processed.`);
}

seed().catch((error) => {
  console.error('Product seed failed:', error);
  process.exitCode = 1;
}).finally(async () => {
  await mongoose.disconnect();
});
