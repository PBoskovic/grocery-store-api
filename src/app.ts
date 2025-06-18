import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRouter from './routes/auth'
import usersRouter from './routes/users';
import orgNodesRouter from './routes/orgnodes';
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "./swagger";
import { logger } from './utils/logger';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grocery-store';

// Only connect if NOT in test
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(MONGODB_URI)
        .then(() => logger.info('MongoDB connected'))
        .catch(err => {
            logger.error('MongoDB connection error:', err);
            process.exit(1);
        });
}

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/orgnodes', orgNodesRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`Server started on port ${PORT}`);
    });
}

export default app;
