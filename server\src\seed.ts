import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDb } from './db';
import { User } from './models/User';

async function seed() {
  await connectDb();

  const existingUser = await User.findOne({ email: 'demo@music.com' });
  if (!existingUser) {
    await User.create({
      email: 'demo@music.com', displayName: 'Demo User',
      passwordHash: await bcrypt.hash('demo123', 10),
    });

    console.log('Demo user created: demo@music.com / demo123');
  }

  console.log('Database seeded successfully!');
  await mongoose.disconnect();
}

seed().catch(console.error);
