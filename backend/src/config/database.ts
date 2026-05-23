import mongoose from 'mongoose';
import { config } from './index';

export async function connectDatabase(): Promise<void> {
  console.log('MONGODB_URI env:', process.env.MONGODB_URI ? 'set' : 'not set');
  console.log('MONGO_URL env:', process.env.MONGO_URL ? 'set' : 'not set');
  console.log('MONGODB_URL env:', process.env.MONGODB_URL ? 'set' : 'not set');
  console.log('Using MongoDB URI:', config.mongodbUri);
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB runtime error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
}
