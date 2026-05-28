import { Router, Request, Response, NextFunction } from "express";
import { upload } from "../../infra/upload";
import { authRequired } from "../middlewares/auth";
import { prisma } from "../services/database.service";
import { HttpError } from "../../infra/errors";
import path from "path";

const r = Router();

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload ảnh đại diện cho user
 *     tags: [Users]
 *     security: [{ BearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar: 
 *                 type: string
 *                 format: binary
 *                 description: File ảnh đại diện (JPG, PNG, GIF, max 5MB)
 *     responses:
 *       200:
 *         description: Upload thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 avatarUrl:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Lỗi validation hoặc file không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       413:
 *         description: File quá lớn
 */
r.post("/avatar", authRequired, (req: Request, res: Response, next: NextFunction) => {
  // Custom multer config cho avatar - chỉ cho phép image files
  const avatarUpload = upload.single("avatar");
  
  avatarUpload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new HttpError(413, 'File quá lớn. Kích thước tối đa là 5MB'));
      }
      return next(new HttpError(400, `Lỗi upload: ${err.message}`));
    }

    try {
      if (!req.file) {
        return next(new HttpError(400, 'Không có file được upload'));
      }

      // Kiểm tra loại file
      const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        return next(new HttpError(400, 'Chỉ cho phép file ảnh (JPG, PNG, GIF, WebP)'));
      }

      const user = (req as any).user;
      const avatarUrl = `/uploads/${req.file.filename}`;

      // Cập nhật avatar URL trong database
      const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: { avatarUrl },
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

      res.json({
        message: 'Upload ảnh đại diện thành công',
        avatarUrl,
        user: updatedUser
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      next(new HttpError(500, 'Lỗi server khi upload avatar'));
    }
  });
});

/**
 * @swagger
 * /api/users/avatar:
 *   delete:
 *     summary: Xóa ảnh đại diện
 *     tags: [Users]
 *     security: [{ BearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Chưa đăng nhập
 */
r.delete("/avatar", authRequired, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    // Xóa avatar URL trong database
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: { avatarUrl: null },
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

    res.json({
      message: 'Xóa ảnh đại diện thành công',
      user: updatedUser
    });
  } catch (error) {
    console.error('Avatar delete error:', error);
    next(new HttpError(500, 'Lỗi server khi xóa avatar'));
  }
});

export default r;