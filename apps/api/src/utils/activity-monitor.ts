import { prisma } from '../services/database.service';

// Import memory cache from auth controller
let userLastActivity: any = null;
try {
  const authController = require('../controllers/auth.controller');
  userLastActivity = authController.userLastActivity || {};
} catch (error) {
  console.log('[Activity Monitor] Could not access user activity cache');
}

// Check for inactive users every 1 minute
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute  
const INACTIVE_THRESHOLD = 10 * 60 * 1000; // 10 minutes

export const startActivityMonitor = () => {
  setInterval(async () => {
    try {
      const now = new Date();
      const cutoffTime = new Date(now.getTime() - INACTIVE_THRESHOLD);
      
      // Find users who are marked as active but haven't had activity recently
      const inactiveUsers = await prisma.user.findMany({
        where: {
          isCurrentlyActive: true,
          lastActivityAt: {
            lt: cutoffTime
          }
        },
        select: { id: true, email: true, lastActivityAt: true }
      });
      
      if (inactiveUsers.length > 0) {
        console.log(`[Activity Monitor] Found ${inactiveUsers.length} inactive users, setting them offline`);
        
        // Set them as inactive
        await prisma.user.updateMany({
          where: {
            id: { in: inactiveUsers.map(u => u.id) }
          },
          data: {
            isCurrentlyActive: false,
            lastActivityType: 'auto-logout'
          }
        });
        
        inactiveUsers.forEach(user => {
          console.log(`[Activity Monitor] Auto-logout user ${user.email} (last activity: ${user.lastActivityAt})`);
          
          // Update memory cache as well
          if (userLastActivity && userLastActivity[user.id]) {
            userLastActivity[user.id] = {
              ...userLastActivity[user.id],
              isCurrentlyActive: false,
              lastActivityType: 'auto-logout'
            };
          }
        });
      }
    } catch (error) {
      console.error('[Activity Monitor] Error checking inactive users:', error);
    }
  }, ACTIVITY_CHECK_INTERVAL);
  
  console.log(`[Activity Monitor] Started - checking every ${ACTIVITY_CHECK_INTERVAL/1000}s for users inactive > ${INACTIVE_THRESHOLD/1000}s`);
};