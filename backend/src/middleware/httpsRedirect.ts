import { Request, Response, NextFunction } from 'express';

export function httpsRedirect(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'production' &&
        !req.secure &&
        req.get('x-forwarded-proto') !== 'https') {
        return res.redirect(301, `https://${req.get('host')}${req.url}`);
    }
    next();
}
