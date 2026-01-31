import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Recursive function to sanitize objects
 */
const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
        return xss(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(sanitize);
    }
    if (obj && typeof obj === 'object') {
        Object.keys(obj).forEach((key) => {
            obj[key] = sanitize(obj[key]);
        });
        return obj;
    }
    return obj;
};

export const xssMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.query) req.query = sanitize(req.query);
    if (req.params) req.params = sanitize(req.params);
    next();
};
