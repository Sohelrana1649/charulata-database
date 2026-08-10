import mongoose from 'mongoose';
import { config } from '../config';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Sync indexes so schema changes (e.g. adding sparse: true) are applied
    await conn.connection.syncIndexes();
    console.log('MongoDB indexes synced');
  } catch (error) {
    console.error(`Database connection error: ${error}`);
    process.exit(1);
  }
};
