import { Request, Response, NextFunction } from 'express';

// Import activity tracking function
const trackActivity = (activityType: string, description: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original res.json để intercept response
    const originalJson = res.json;
    
    res.json = function(obj) {
      // Chỉ track nếu response thành công (status < 400)
      if (res.statusCode < 400) {
        const user = (req as any).user;
        if (user && user.userId) {
          // Import và gọi updateUserActivity và logUserActivity
          (async () => {
            try {
              const { updateUserActivity } = require("../controllers/auth.controller");
              const { logUserActivity } = require("../routes/users.routes");
              
              console.log(`[Activity Tracker] User ${user.userId} - ${activityType}: ${description}`);
              
              // Cập nhật last activity
              await updateUserActivity(user.userId, activityType);
              
              // Log chi tiết activity
              logUserActivity(user.userId, activityType, description);
              
            } catch (error) {
              console.error('Error tracking user activity:', error);
            }
          })();
        }
      }
      
      // Gọi original res.json
      return originalJson.call(this, obj);
    };
    
    next();
  };
};

export { trackActivity };