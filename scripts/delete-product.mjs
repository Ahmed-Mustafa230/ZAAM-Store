import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/zaam-store';

const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find products with 'dior' in name and category 'shirts'
  const found = await Product.find({ name: { $regex: /dior/i }, category: 'shirts' }).lean();
  console.log('Found products:', found.length);
  found.forEach(p => console.log(`  - ${p.name} (${p._id})`));

  if (found.length === 0) {
    console.log('No matching product found. Searching all products with "dior"...');
    const allDior = await Product.find({ name: { $regex: /dior/i } }).lean();
    allDior.forEach(p => console.log(`  - ${p.name} (${p._id}) category: ${p.category}`));
  }

  const result = await Product.deleteOne({ name: { $regex: /dior/i }, category: 'shirts' });
  console.log('Delete result:', result);

  await mongoose.disconnect();
}

main().catch(console.error);
