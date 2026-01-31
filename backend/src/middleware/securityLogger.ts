import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import path from 'path';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [],
});

if (process.env.NODE_ENV !== 'production') {
    // ensure logs directory exists
    const fs = require('fs');
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    logger.add(new winston.transports.File({ filename: path.join(logDir, 'security.log') }));
    logger.add(new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }));
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
} else {
    // In production (Vercel), log only to console
    logger.add(new winston.transports.Console());
}

export function logSecurityEvent(event: string, details: any, req?: Request) {
    logger.info({
        event,
        ip: req?.ip || req?.socket.remoteAddress,
        path: req?.path,
        userAgent: req?.get('user-agent'),
        ...details
    });
}

export function securityLogger(req: Request, res: Response, next: NextFunction) {
    // Log suspicious patterns in body or query
    const suspiciousPatterns = ['<script', 'javascript:', 'onerror=', '../', '..\\', 'UNION SELECT'];
    const content = JSON.stringify(req.body) + JSON.stringify(req.query);

    for (const pattern of suspiciousPatterns) {
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
            logSecurityEvent('SUSPICIOUS_INPUT', {
                pattern,
                body: req.body,
                query: req.query
            }, req);
            break;
        }
    }

    next();
}

export default logger;
