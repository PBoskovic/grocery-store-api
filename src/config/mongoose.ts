// src/config/mongoose.ts
import mongoose from 'mongoose';

export const connectMongo = async (uri: string) => {
    mongoose.set('strictQuery', false); // Prevents deprecation warning
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
};

export const disconnectMongo = async () => {
    await mongoose.disconnect();
};
