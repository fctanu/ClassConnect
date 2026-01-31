import cron from 'node-cron';
import User from '../models/User';

export function startCleanupJobs() {
    // Run daily at 3 AM to clean up old/expired refresh tokens
    cron.schedule('0 3 * * *', async () => {
        try {
            console.log('[SECURITY] Running token cleanup job...');

            // Clear refresh tokens from users inactive for 30+ days
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const result = await User.updateMany(
                { 'updatedAt': { $lt: thirtyDaysAgo } },
                { $set: { refreshTokens: [] } }
            );

            console.log(`[SECURITY] Token cleanup completed. Cleared tokens from ${result.modifiedCount} inactive users.`);
        } catch (error) {
            console.error('[SECURITY] Token cleanup failed:', error);
        }
    });

    console.log('[SECURITY] Scheduled daily token cleanup job (runs at 3 AM)');
}
