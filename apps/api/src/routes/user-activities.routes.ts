import { Router } from "express";
import { authRequired } from "../middlewares/auth";
import { allow } from "../middlewares/rbac";

const r = Router();

/**
 * @swagger
 * /user-activities:
 *   get:
 *     summary: Lấy lịch sử hoạt động users (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
r.get("/", authRequired, allow('ADMIN'), async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const userId = req.query.userId as string;

  // Lấy activities từ global userActivities (sẽ được populated khi users thực hiện actions)
  const { getUserActivities } = require("../routes/users.routes");
  let allActivities = getUserActivities();
  
  // Nếu chưa có activities thật, dùng mock data
  if (allActivities.length === 0) {
    const now = new Date();
    allActivities = [
      {
        id: "activity_demo_1",
        userId: "1", // Admin user
        activityType: "login",
        timestamp: now.toISOString(),
        description: "Đăng nhập hệ thống"
      },
      {
        id: "activity_demo_2", 
        userId: "2", // Regular user
        activityType: "login",
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        description: "Đăng nhập hệ thống"
      },
      {
        id: "activity_demo_3",
        userId: "2",
        activityType: "transaction",
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        description: "Tạo giao dịch mới"
      },
      {
        id: "activity_demo_4",
        userId: "2",
        activityType: "account",
        timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        description: "Xem danh sách tài khoản"
      },
      {
        id: "activity_demo_5",
        userId: "3", // Phai user
        activityType: "budget",
        timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        description: "Tạo ngân sách mới"
      },
      {
        id: "activity_demo_6",
        userId: "3",
        activityType: "report",
        timestamp: new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
        description: "Xem báo cáo tháng"
      },
      {
        id: "activity_demo_7",
        userId: "2",
        activityType: "transaction",
        timestamp: new Date(now.getTime() - 150 * 60 * 1000).toISOString(),
        description: "Cập nhật giao dịch"
      },
      {
        id: "activity_demo_8",
        userId: "1", // Admin
        activityType: "account",
        timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
        description: "Truy cập danh sách tài khoản"
      },
      {
        id: "activity_demo_9",
        userId: "3", // Phai  
        activityType: "transaction",
        timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
        description: "Tạo giao dịch mới"
      }
    ];
  }

  // Filter theo userId nếu có
  let filteredActivities = allActivities;
  if (userId) {
    filteredActivities = allActivities.filter((a: any) => a.userId === userId);
  }

  // Sort theo timestamp desc
  filteredActivities.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const total = filteredActivities.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filteredActivities.slice(startIndex, endIndex);

  res.json({
    items,
    meta: { page, limit, total }
  });
});

export default r;