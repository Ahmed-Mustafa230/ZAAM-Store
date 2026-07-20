import mongoose from 'mongoose';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaam-store';

console.log("Using MongoDB:", MONGODB_URI);

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

const products = [
  {
    name: 'Oud Royale',
    description: 'A captivating blend of rare oud wood, amber, and warm spices. This long-lasting fragrance opens with top notes of bergamot and saffron, settling into a rich base of leather and musk.',
    category: 'perfumes',
    price: 285,
    comparePrice: 350,
    images: [
      { public_id: 'perfume_1', url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80', secure_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80', is_primary: true },
    ],
    brand: 'Maison de Luxe',
    stock: 25,
    sizes: ['50ml', '100ml'],
    colors: [],
    isFeatured: true,
    isNewArrival: true,
    discount: 19,
    tags: ['oud', 'oriental', 'luxury', 'long-lasting'],
    rating: 4.8,
    numReviews: 124,
  },
  {
    name: 'Merino Silk Tee',
    description: 'Crafted from the finest merino wool blended with silk, this tee offers unparalleled softness and breathability. Perfect for both casual and formal occasions.',
    category: 'shirts',
    price: 189,
    comparePrice: 0,
    images: [
      { public_id: 'tshirt_1', url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', secure_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', is_primary: true },
    ],
    brand: 'Artisan Threads',
    stock: 50,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#1a1a2e', '#f5f5f5', '#8b4513'],
    isFeatured: true,
    isNewArrival: false,
    discount: 0,
    tags: ['merino', 'silk', 'premium', 'casual'],
    rating: 4.6,
    numReviews: 89,
  },
  {
    name: 'Sapphire Chronograph',
    description: 'A masterpiece of precision engineering featuring a sapphire crystal face, genuine leather strap, and Swiss quartz movement. Water-resistant to 100 meters.',
    category: 'watches',
    price: 2950,
    comparePrice: 3500,
    images: [
      { public_id: 'watch_1', url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80', secure_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80', is_primary: true },
    ],
    brand: 'Horology Labs',
    stock: 10,
    sizes: [],
    colors: ['#0a0a0a', '#c0c0c0'],
    isFeatured: true,
    isNewArrival: false,
    discount: 16,
    tags: ['chronograph', 'sapphire', 'swiss', 'luxury'],
    rating: 4.9,
    numReviews: 56,
  },
  {
    name: 'Velvet Noir Trouser',
    description: 'Slim-fit trousers crafted from premium cotton-blend velvet. Features a modern tapered cut with a mid-rise waist, perfect for evening wear.',
    category: 'pants',
    price: 45,
    comparePrice: 0,
    images: [
      { public_id: 'pant_1', url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80', secure_url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80', is_primary: true },
    ],
    brand: 'Pigment & Co',
    stock: 35,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['#0a0a0a', '#1a1a2e'],
    isFeatured: false,
    isNewArrival: true,
    discount: 0,
    tags: ['velvet', 'trouser', 'slim-fit', 'evening'],
    rating: 4.5,
    numReviews: 203,
  },
  {
    name: 'Amber Mystique',
    description: 'An enchanting oriental fragrance with notes of amber, vanilla, and rose. Warm and sophisticated, it lingers beautifully throughout the day.',
    category: 'perfumes',
    price: 320,
    comparePrice: 0,
    images: [
      { public_id: 'perfume_2', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80', secure_url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80', is_primary: true },
    ],
    brand: 'Maison de Luxe',
    stock: 30,
    sizes: ['50ml', '100ml'],
    colors: [],
    isFeatured: true,
    isNewArrival: false,
    discount: 0,
    tags: ['amber', 'oriental', 'floral', 'warm'],
    rating: 4.7,
    numReviews: 98,
  },
  {
    name: 'Cashmere Blend Tee',
    description: 'Luxuriously soft cashmere and cotton blend crew-neck tee. Lightweight yet warm, with ribbed cuffs and a relaxed fit for effortless style.',
    category: 'shirts',
    price: 245,
    comparePrice: 295,
    images: [
      { public_id: 'tshirt_2', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80', secure_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80', is_primary: true },
    ],
    brand: 'Artisan Threads',
    stock: 0,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['#2d2d2d', '#f5f5f5', '#8b0000'],
    isFeatured: false,
    isNewArrival: false,
    discount: 17,
    tags: ['cashmere', 'cotton', 'blend', 'crew-neck'],
    rating: 4.4,
    numReviews: 67,
  },
  {
    name: 'Midnight Sun Chinos',
    description: 'Premium stretch chinos with a modern slim fit. Made from comfort-stretch cotton twill with a tailored look that transitions seamlessly from office to evening.',
    category: 'pants',
    price: 55,
    comparePrice: 0,
    images: [
      { public_id: 'pant_2', url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2eab?w=600&q=80', secure_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2eab?w=600&q=80', is_primary: true },
    ],
    brand: 'Pigment & Co',
    stock: 45,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['#1a1a2e', '#4a4a4a', '#d4a574'],
    isFeatured: false,
    isNewArrival: true,
    discount: 0,
    tags: ['chinos', 'stretch', 'slim-fit', 'office'],
    rating: 4.3,
    numReviews: 145,
  },
  {
    name: 'Celestial Moonphase',
    description: 'An extraordinary timepiece featuring a moonphase complication, skeleton dial, and hand-stitched alligator strap. Limited edition of 100 pieces worldwide.',
    category: 'watches',
    price: 5200,
    comparePrice: 0,
    images: [
      { public_id: 'watch_2', url: 'https://images.unsplash.com/photo-1548171915-e3cb2c212a5a?w=600&q=80', secure_url: 'https://images.unsplash.com/photo-1548171915-e3cb2c212a5a?w=600&q=80', is_primary: true },
    ],
    brand: 'Horology Labs',
    stock: 5,
    sizes: [],
    colors: ['#0a0a0a', '#1a1a2e'],
    isFeatured: true,
    isNewArrival: false,
    discount: 0,
    tags: ['moonphase', 'skeleton', 'limited-edition', 'luxury'],
    rating: 5.0,
    numReviews: 23,
  },
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`Found ${existing} existing products. Clearing before seeding...`);
    await Product.deleteMany({});
  }

  const result = await Product.insertMany(products);
  console.log(`Successfully seeded ${result.length} products:`);
  result.forEach((p) => console.log(`  - ${p.name} (${p.category})`));

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
