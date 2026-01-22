import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import { authLimiter } from './middleware/rateLimiter';
import tasksRoutes from './routes/tasks';
import projectRoutes from './routes/projects';
import 'express-async-errors';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/projects', projectRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// centralized error handler
app.use(errorHandler);

export default app;
