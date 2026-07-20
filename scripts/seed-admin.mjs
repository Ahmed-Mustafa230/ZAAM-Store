import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/zaam-store';

console.log('Using MongoDB:', MONGODB_URI);

const adminSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const Admin = mongoose.model('Admin', adminSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const email = 'ahmedmuatafa0786@gmail.com';
  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log('Admin account already exists. Skipping creation.');
    await mongoose.disconnect();
    return;
  }

  const salt = await bcryptjs.genSalt(12);
  const hashedPassword = await bcryptjs.hash('itx@Z@$@m0#!', salt);

  await Admin.create({
    name: 'Admin',
    email,
    password: hashedPassword,
    role: 'admin',
    phone: '',
    avatar: '',
    addresses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('Default admin account created successfully.');
  console.log(`Email: ${email}`);
  console.log('Password: itx@Z@$@m0#!');
  console.log('Role: admin');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
