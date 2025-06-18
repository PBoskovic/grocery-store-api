// src/config/mongoose.ts
import mongoose from 'mongoose';
import { logger } from "../utils/logger";

export const connectMongo = async (uri: string) => {
    mongoose.set('strictQuery', false); // Prevents deprecation warning
    await mongoose.connect(uri);
    logger.info('Connected to MongoDB');
};

export const disconnectMongo = async () => {
    await mongoose.disconnect();
};
