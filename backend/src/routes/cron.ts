import { Router, Request, Response } from 'express';
import { runCleanup } from '../utils/cleanup';

const router = Router();

// This endpoint is for Vercel Cron
router.get('/cleanup', async (req: Request, res: Response) => {
    // Basic verification using a secret header (Vercel automatically sets this)
    const authHeader = req.headers['authorization'];
    const cronSecret = process.env.CRON_SECRET;

    // Optional: Check if request is from Vercel Cron or authenticated source
    // On Vercel, you can check `req.headers['x-vercel-cron']` or use a shared secret
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const count = await runCleanup();
        res.json({ success: true, cleared: count });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Cleanup failed' });
    }
});

export default router;
