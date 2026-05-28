import { Router } from "express";
import { authRequired } from "../middlewares/auth";
import { allow } from "../middlewares/rbac";
import { upload } from "../../infra/upload";
import { prisma } from "../services/database.service";
import { getAllUsers, getUserLastActivity } from "../controllers/auth.controller";
import avatarRoutes from "./avatar.routes";

// Activity tracking storage
let userActivities: any[] = [];

// Helper function để log activity
const logActivity = (userId: string, activityType: string, description: string) => {
  userActivities.push({
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    activityType,
    timestamp: new Date().toISOString(),
    description
  });
  // Giữ chỉ 1000 activities gần nhất
  if (userActivities.length > 1000) {
    userActivities = userActivities.slice(-1000);
  }
};

// Export function để các modules khác có thể access userActivities
export const getUserActivities = () => userActivities;
export const logUserActivity = logActivity;

const r = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Users]
 *     responses:
 *       200: { description: OK }
 */
r.get("/me", authRequired, async (req, res) => {
  const userId = (req as any).user.userId as string;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt.toISOString()
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Cập nhật thông tin người dùng hiện tại
 *     tags: [Users]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200: { description: OK }
 */
r.put("/me", authRequired, async (req, res) => {
  const userId = (req as any).user.userId as string;
  const { fullName, email } = req.body;
  
  try {
    // Validate input
    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng bởi tài khoản khác' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { fullName, email },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // Log activity
    logActivity(userId, 'profile-update', `Cập nhật thông tin cá nhân`);

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @swagger
 * /users/me/avatar:
 *   post:
 *     summary: Upload ảnh đại diện
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: OK }
 */
r.post("/me/avatar", authRequired, upload.single("file"), async (req, res) => {
  const userId = (req as any).user.userId as string;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    
    // Update user's avatarUrl in database
    await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    });

    // Log activity
    logActivity(userId, 'avatar-upload', 'Cập nhật ảnh đại diện');

    res.json({ avatarUrl });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Admin-only routes for user management
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lấy danh sách users (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, USER] }
 *     responses:
 *       200: { description: OK }
 */
r.get("/", authRequired, allow('ADMIN'), async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const role = req.query.role as string;
  
  try {
    // Lấy users từ database
    const users = await prisma.user.findMany({
      where: role ? { role: role as any } : {},
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Transform users thành format cần thiết với activity data
    const transformedUsers = await Promise.all(users.map(async (user) => {
      const lastActivity = await getUserLastActivity(user.id);
      const isCurrentlyActive = lastActivity?.isCurrentlyActive === true;
      
      return {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        lastLoginAt: lastActivity?.lastLoginAt || null,
        lastActivityAt: lastActivity?.lastActivityAt || null,
        lastActivityType: lastActivity?.lastActivityType || null,
        isActive: isCurrentlyActive, // Overall status
        isCurrentlyActive, // Currently logged in or not
        createdAt: user.createdAt.toISOString()
      };
    }));

    const total = transformedUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = transformedUsers.slice(startIndex, endIndex);

    res.json({
      items,
      meta: { page, limit, total }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Lấy thông tin user chi tiết (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
r.get("/:id", authRequired, allow('ADMIN'), async (req, res) => {
  const { id } = req.params;
  
  try {
    // Lấy user từ database
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add activity data
    const lastActivity = await getUserLastActivity(user.id);
    const isCurrentlyActive = lastActivity?.isCurrentlyActive === true;
    
    const userWithActivity = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      lastLoginAt: lastActivity?.lastLoginAt || null,
      lastActivityAt: lastActivity?.lastActivityAt || null,
      lastActivityType: lastActivity?.lastActivityType || null,
      isActive: isCurrentlyActive,
      createdAt: user.createdAt.toISOString()
    };

    res.json(userWithActivity);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Xóa user (Admin only)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User deleted successfully }
 *       400: { description: Cannot delete yourself }
 *       404: { description: User not found }
 */
r.delete("/:id", authRequired, allow('ADMIN'), async (req, res) => {
  const { id } = req.params;
  const currentUserId = (req as any).user.userId;
  
  try {
    // Không cho phép admin tự xóa chính mình
    if (id === currentUserId) {
      return res.status(400).json({ error: 'Không thể xóa chính bản thân' });
    }

    // Kiểm tra user có tồn tại không
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Xóa tất cả dữ liệu liên quan đến user
    // 1. Xóa transactions
    await prisma.transaction.deleteMany({
      where: { userId: id }
    });

    // 2. Xóa accounts
    await prisma.account.deleteMany({
      where: { ownerId: id }
    });

    // 3. Xóa categories
    await prisma.category.deleteMany({
      where: { ownerId: id }
    });

    // 4. Cuối cùng xóa user
    await prisma.user.delete({
      where: { id }
    });

    // Log activity
    logActivity(currentUserId, 'user-management', `Đã xóa người dùng: ${user.email}`);

    res.json({ 
      success: true, 
      message: `Đã xóa người dùng ${user.email} và tất cả dữ liệu liên quan` 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Có lỗi khi xóa người dùng' });
  }
});

// Avatar routes
r.use(avatarRoutes);

export default r;
