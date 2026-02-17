import db from '../models/db.js';

/**
 * Remove expried Sessions
 */

const cleanupExpiredSessions = async () => {
    try {
        const result = await db.query(
            `DELETE FROM session WHERE expire < NOW()`
        );

        if (result.rowCount > 0) {
            console.log(`Cleaned up ${result.rowCount} expired sessions;`)
        }
    } catch(error) {
        // Error code 42P01 = table not created
        if (error.code === '42P01') {
            console.log('Session table not created yet:\n It will be created after first initializtion');
            return;
        }

        console.error('Session clean up error:', error);
    }
};

const startSessionCleanup = () => {
    cleanupExpiredSessions();

    const twelveHours = 12 * 60 * 60 * 1000;
    setInterval(cleanupExpiredSessions, twelveHours);

    console.log('Session cleanup scheduled every 12 hours');
};

export { startSessionCleanup };
