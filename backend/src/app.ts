import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import authRoutes from './routes/auth';
import { authLimiter } from './middleware/rateLimiter';
import postsRoutes from './routes/posts';
import 'express-async-errors';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/posts', postsRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// centralized error handler
app.use(errorHandler);

export default app;
