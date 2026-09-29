const mongoose = require('mongoose');
const { ProductModel } = require('../dist/models/product-model.js');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meshly_products';
const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

const baseProducts = [
  ['Aster Wireless Headphones', 'Balanced wireless headphones with soft memory-foam cushions and a focused listening mode.', 129, 'ELEC-ASTER-HEADPHONES', 'Electronics', 24, 'photo-1505740420928-5e560c06d30e'],
  ['Orbit Desk Lamp', 'A compact adjustable LED desk lamp with warm-to-cool light for focused work.', 78, 'ELEC-ORBIT-LAMP', 'Electronics', 18, 'photo-1507473885765-e6ed057f782c'],
  ['Field Bluetooth Speaker', 'A portable speaker with clear room-filling sound, tactile controls, and an all-day battery.', 89, 'ELEC-FIELD-SPEAKER', 'Electronics', 21, 'photo-1608043152269-423dbba4e7e1'],
  ['Nook Mechanical Keyboard', 'A compact mechanical keyboard with quiet tactile switches and a clean aluminum frame.', 116, 'ELEC-NOOK-KEYBOARD', 'Electronics', 16, 'photo-1587829741301-dc798b83add3'],
  ['Arc USB-C Hub', 'A slim seven-port hub that keeps your laptop setup connected without taking over your desk.', 54, 'ELEC-ARC-USB-HUB', 'Electronics', 29, 'photo-1625842268584-8f3296236761'],
  ['Morrow E-Reader Sleeve', 'A protective felt sleeve with a soft lining and a simple magnetic closure for daily reading.', 38, 'ELEC-MORROW-SLEEVE', 'Electronics', 34, 'photo-1544947950-fa07a98d237f'],
  ['Field Canvas Overshirt', 'A sturdy cotton-canvas overshirt with useful pockets and an easy everyday fit.', 96, 'CLOTH-FIELD-OVERSHIRT', 'Clothing', 32, 'photo-1551488831-00ddcb6c6bd3'],
  ['Loom Everyday Tote', 'A durable woven tote with a broad base for books, groceries, and daily essentials.', 42, 'CLOTH-LOOM-TOTE', 'Clothing', 41, 'photo-1544816155-12df9643f363'],
  ['Harbor Knit Sweater', 'A soft mid-weight knit sweater with a relaxed shape for cool mornings and layered days.', 108, 'CLOTH-HARBOR-SWEATER', 'Clothing', 25, 'photo-1434389677669-e08b4cac3105'],
  ['Rowan Everyday Cap', 'A six-panel cotton cap with an adjustable back and an understated embroidered mark.', 32, 'CLOTH-ROWAN-CAP', 'Clothing', 46, 'photo-1521369909029-2afed882baee'],
  ['Sable Relaxed Trousers', 'Comfortable straight-leg trousers cut from a durable cotton blend with a clean drape.', 88, 'CLOTH-SABLE-TROUSERS', 'Clothing', 22, 'photo-1506629905607-d9b1d1d3f0a3'],
  ['Vale Merino Scarf', 'A lightweight merino scarf with a soft hand and enough warmth for changing seasons.', 64, 'CLOTH-VALE-SCARF', 'Clothing', 27, 'photo-1520903920243-00d872a2d1c9'],
  ['Ridge Ceramic Pour-Over', 'Hand-finished ceramic brewer designed for a calm, consistent morning ritual.', 36, 'HOME-RIDGE-BREWER', 'Home', 27, 'photo-1495474472287-4d71bcdd2085'],
  ['Moss Linen Throw', 'A breathable linen-cotton throw in a muted moss tone for couches and reading corners.', 84, 'HOME-MOSS-THROW', 'Home', 15, 'photo-1584100936595-c0654b55a2e2'],
  ['Forma Oak Side Table', 'A compact solid-oak side table with a softly rounded edge and a useful lower shelf.', 178, 'HOME-FORMA-SIDE-TABLE', 'Home', 9, 'photo-1532372320572-cda25653a26d'],
  ['Still Stoneware Vase', 'A matte stoneware vase with a quiet silhouette for branches, stems, or an empty shelf.', 48, 'HOME-STILL-VASE', 'Home', 19, 'photo-1612196808214-b8e1d6145a8c'],
  ['Dune Cotton Cushion', 'A textured cotton cushion in a warm neutral weave, finished with a hidden zip.', 34, 'HOME-DUNE-CUSHION', 'Home', 38, 'photo-1584100936595-c0654b55a2e2'],
  ['Lumen Reed Diffuser', 'A subtle botanical fragrance with a glass vessel made for bedside tables and entryways.', 29, 'HOME-LUMEN-DIFFUSER', 'Home', 31, 'photo-1603006905003-be475563bc59'],
  ['Northline Chef Knife', 'A balanced stainless-steel chef knife with a comfortable walnut handle.', 68, 'KITCH-NORTHLINE-KNIFE', 'Kitchen', 20, 'photo-1593618998160-e34014e67546'],
  ['Everyday Glass Carafe', 'A clear borosilicate glass carafe with a simple pour spout for the table or fridge.', 29, 'KITCH-GLASS-CARAFE', 'Kitchen', 36, 'photo-1523362628745-0c100150b504'],
  ['Hearth Cast-Iron Pan', 'A pre-seasoned cast-iron pan built for weeknight cooking, baking, and generous servings.', 74, 'KITCH-HEARTH-PAN', 'Kitchen', 17, 'photo-1556911220-e15b29be8c8f'],
  ['Grain Walnut Board', 'A thick walnut serving board with a generous surface for prep, bread, and shared plates.', 58, 'KITCH-GRAIN-BOARD', 'Kitchen', 23, 'photo-1547592180-85f173990554'],
  ['Steep Glass Teapot', 'A heat-resistant glass teapot with a fine stainless-steel infuser for loose-leaf tea.', 46, 'KITCH-STEEP-TEAPOT', 'Kitchen', 14, 'photo-1544787219-7f47ccb76574'],
  ['Savor Linen Apron', 'A cross-back linen apron with deep pockets and an easy fit for everyday cooking.', 52, 'KITCH-SAVOR-APRON', 'Kitchen', 26, 'photo-1556910103-1c02745aae4d'],
  ['Transit Weekender', 'A structured recycled-nylon weekender with a padded sleeve and separate shoe compartment.', 148, 'TRAVEL-TRANSIT-WEEKENDER', 'Travel', 12, 'photo-1553062407-98eeb64c6a62'],
  ['North Coast Daypack', 'A weather-resistant daypack with a padded laptop sleeve and a balanced everyday carry.', 124, 'TRAVEL-NORTH-DAYPACK', 'Travel', 18, 'photo-1551632811-561732d1e306'],
  ['Foldaway Travel Blanket', 'A lightweight packable blanket for long rides, open-air lunches, and cool evenings.', 62, 'TRAVEL-FOLD-BLANKET', 'Travel', 21, 'photo-1504851149312-7a075b496cc7'],
  ['Atlas Packing Cubes', 'A three-piece set of structured packing cubes that keeps luggage calm and easy to reach.', 44, 'TRAVEL-ATLAS-CUBES', 'Travel', 33, 'photo-1436491865332-7a61a109cc05'],
  ['Cove Travel Mug', 'A leak-resistant insulated mug that keeps coffee warm through commutes and connections.', 31, 'TRAVEL-COVE-MUG', 'Travel', 35, 'photo-1495474472287-4d71bcdd2085'],
  ['Roam Leather Passport Case', 'A slim vegetable-tanned leather case with room for a passport, cards, and travel notes.', 57, 'TRAVEL-ROAM-PASSPORT', 'Travel', 28, 'photo-1529070538774-1843cb3265df'],
].map(([name, description, price, sku, category, inventoryCount, imageId]) => ({ name, description, price, sku, category, inventoryCount, imageUrl: image(imageId), isActive: true }));

const expansions = {
  Electronics: [
    'Clarity Noise-Canceling Earbuds', 'Halo Smart Watch', 'Drift Portable Monitor', 'Pulse Charging Stand',
    'Frame Webcam', 'Signal Wi-Fi Speaker', 'Slate Tablet Stand', 'Aero Travel Adapter',
    'Loop Wireless Charger', 'Mica Desk Fan', 'Focus USB Microphone', 'Nest Cable Organizer',
    'Beam Reading Light', 'North Bluetooth Tracker', 'Echo Audio Cable', 'Vista Laptop Riser',
    'Kindle Desk Timer', 'Cloud Ergonomic Mouse', 'Relay Power Bank', 'Pixel HDMI Adapter',
    'Studio Monitor Stand', 'Tempo Digital Alarm', 'Quill Stylus Pen', 'Cove Smart Plug',
  ],
  Clothing: [
    'Lark Cotton Shirt', 'Marlow Chore Jacket', 'Cedar Knit Polo', 'Piper Linen Dress',
    'Elm Straight Jeans', 'Sora Ribbed Cardigan', 'Juniper Wool Coat', 'Wren Cotton Shorts',
    'Bramble Fleece Hoodie', 'Ivy Everyday Socks', 'Ash Canvas Belt', 'Mabel Silk Scarf',
    'Oriel Slip-On Shoes', 'Fern Jersey Tee', 'Caspian Tailored Blazer', 'Nora Ribbed Tank',
    'Alden Corduroy Shirt', 'Meadow Lounge Set', 'Briar Rain Jacket', 'Sol Cotton Chinos',
    'Parker Knit Beanie', 'Tess Leather Gloves', 'Milo Oxford Shirt', 'Willow Utility Vest',
  ],
  Home: [
    'Haven Wool Rug', 'Cove Oak Tray', 'Sage Table Clock', 'Lumen Task Light',
    'Birch Wall Hook', 'Onda Ceramic Bowl', 'Quiet Cotton Towels', 'Arden Linen Curtains',
    'Morrow Storage Basket', 'Vale Brass Mirror', 'Nook Bedside Shelf', 'Clay Incense Holder',
    'Still Glass Candle', 'Field Picnic Blanket', 'Rill Oak Hanger', 'Dawn Table Runner',
    'Moss Plant Mister', 'Hearth Wool Pillow', 'Forma Coat Stand', 'Lark Serving Tray',
    'Cedar Laundry Hamper', 'Dune Ceramic Planter', 'Harbor Desk Organizer', 'Rowan Floor Cushion',
  ],
  Kitchen: [
    'Morrow Electric Kettle', 'Field Pepper Mill', 'Aster Mixing Bowls', 'Cove Silicone Spatula',
    'Grain Measuring Set', 'Northline Kitchen Shears', 'Hearth Dutch Oven', 'Steep Tea Strainer',
    'Savor Cotton Dish Towels', 'Everyday Lunch Box', 'Ridge Salt Cellar', 'Dune Stoneware Mug',
    'Lumen Oil Bottle', 'Vale Bamboo Utensils', 'Nook Spice Rack', 'Still Salad Servers',
    'Forma Baking Sheet', 'Harbor Coffee Scoop', 'Moss Reusable Wraps', 'Roam Picnic Cutlery',
    'Cedar Cutting Knife', 'Sable Apron Hooks', 'Willow Glass Jars', 'Atlas Food Container',
  ],
  Travel: [
    'Cedar Cabin Duffle', 'Morrow Neck Pillow', 'Aster Travel Wallet', 'Field Compression Socks',
    'Harbor Toiletry Kit', 'Ridge Packing Scale', 'Vale Foldable Tote', 'Northline Luggage Tag',
    'Dune Water Bottle', 'Transit Cable Pouch', 'Cove Sleep Mask', 'Roam Travel Journal',
    'Lumen Headrest Hook', 'Sable Passport Wallet', 'Atlas Shoe Bag', 'Moss Packable Hat',
    'Wander Rain Cover', 'Piper Travel Cutlery', 'Drift Laundry Pouch', 'Summit Hiking Flask',
    'Cairn Travel Umbrella', 'Oriel Compression Bag', 'Sol Carry-On Organizer', 'Briar Luggage Strap',
  ],
};

const imageIds = [
  'photo-1505740420928-5e560c06d30e', 'photo-1551488831-00ddcb6c6bd3',
  'photo-1532372320572-cda25653a26d', 'photo-1593618998160-e34014e67546',
  'photo-1553062407-98eeb64c6a62', 'photo-1495474472287-4d71bcdd2085',
];

const extraProducts = Object.entries(expansions).flatMap(([category, names], categoryIndex) => names.map((name, index) => ({
  name,
  description: `A considered ${category.toLowerCase()} essential designed for everyday living.`,
  price: 24 + ((categoryIndex * 17 + index * 11) % 150),
  sku: `${category.slice(0, 4).toUpperCase()}-${String(index + 7).padStart(2, '0')}-${name.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
  category,
  inventoryCount: 12 + ((index * 7) % 30),
  imageUrl: image(imageIds[(categoryIndex + index) % imageIds.length]),
  isActive: true,
})));

const products = [...baseProducts, ...extraProducts];

async function seed() {
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB at ${mongoUri}`);
  console.log(`Seeding ${products.length} products: 30 per category across five categories...`);
  for (const product of products) {
    const existing = await ProductModel.findOne({ sku: product.sku }).lean();
    const saved = await ProductModel.findOneAndUpdate({ sku: product.sku }, product, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();
    console.log(`${existing ? 'Updated' : 'Inserted'}: ${saved.name} | ${saved.sku} | ${saved._id}`);
  }
  console.log(`Seed complete: ${products.length} products processed (30 per category).`);
}

seed().catch((error) => { console.error('Product seed failed:', error); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });
