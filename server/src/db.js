import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function connectDB(dbName) {
  const configured = process.env.MONGO_URI;
  if (configured) {
    await mongoose.connect(configured);
    console.log(`Connected to MongoDB using MONGO_URI (${dbName}).`);
    return { memory: false };
  }

  const local = `mongodb://127.0.0.1:27017/${dbName}`;
  try {
    await mongoose.connect(local, { serverSelectionTimeoutMS: 2000 });
    console.log(`Connected to local MongoDB (${dbName}).`);
    return { memory: false };
  } catch {
    await mongoose.disconnect().catch(() => {});
    console.log('Local MongoDB is not running. Starting an in-memory database for this session.');
    const memory = await MongoMemoryServer.create();
    await mongoose.connect(memory.getUri());
    return { memory: true };
  }
}
