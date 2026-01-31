import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { httpsRedirect } from './middleware/httpsRedirect';
import { securityLogger } from './middleware/securityLogger';
import authRoutes from './routes/auth';
import { authLimiter, generalApiLimiter } from './middleware/rateLimiter';
import postsRoutes from './routes/posts';
import cronRoutes from './routes/cron';
import 'express-async-errors';
import errorHandler from './middleware/errorHandler';

import connectDB from './config/db';

const app = express();

// Ensure DB is connected on every request (for Serverless)
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
});

// HTTPS redirect in production
if (process.env.NODE_ENV === 'production') {
    app.use(httpsRedirect);
}

// Security Headers with CSP and HSTS
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires unsafe-inline
            imgSrc: ["'self'", "data:", "https:"],
            fontSrc: ["'self'", "data:"],
            connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173'],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    crossOriginEmbedderPolicy: false, // Prevents issues with file uploads
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// NoSQL Injection Protection
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`[SECURITY] Sanitized input detected: ${key} from IP: ${req.ip}`);
    },
}));

// XSS Protection
app.use(xss());

// HTTP Parameter Pollution Protection
app.use(hpp());

// Security Logging for suspicious requests
app.use(securityLogger);

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/posts', generalApiLimiter, postsRoutes);
app.use('/api/cron', cronRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// centralized error handler
app.use(errorHandler);

export default app;
