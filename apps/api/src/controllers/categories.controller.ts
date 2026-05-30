import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { HttpError } from '../../infra/errors';
import { prisma } from '../services/database.service';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải ít nhất 2 ký tự').max(50),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER'])
});

/**
 * List categories for user
 */
export const listCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    const type = req.query.type as string;

    const categories = await prisma.category.findMany({
      where: {
        ownerId: userId,
        ...(type && { type: type.toUpperCase() as any })
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ items: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Get default categories
 */
export const getDefaultCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const type = (req.query.type as string) || 'EXPENSE';
    
    const defaultCategories = {
      EXPENSE: ['Ăn uống', 'Di chuyển', 'Mua sắm', 'Giải trí', 'Y tế', 'Học tập', 'Nhà ở', 'Tiết kiệm', 'Khác'],
      INCOME: ['Lương', 'Thưởng', 'Đầu tư', 'Khác'],
      TRANSFER: ['Chuyển tiền']
    };

    res.json({ 
      items: (defaultCategories[type as keyof typeof defaultCategories] || defaultCategories.EXPENSE).map(name => ({
        name,
        type
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new category
 */
export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    const { name, type } = createCategorySchema.parse(req.body);

    // Check if category already exists
    const existing = await prisma.category.findFirst({
      where: {
        ownerId: userId,
        name: { equals: name, mode: 'insensitive' },
        type: type
      }
    });

    if (existing) {
      return next(new HttpError(400, 'Danh mục này đã tồn tại'));
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        ownerId: userId
      }
    });

    res.status(201).json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new HttpError(400, error.errors[0]?.message || 'Validation error'));
    }
    next(error);
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    const category = await prisma.category.findFirst({
      where: { id, ownerId: userId }
    });

    if (!category) {
      return next(new HttpError(404, 'Không tìm thấy danh mục'));
    }

    // Delete category
    await prisma.category.delete({ where: { id } });

    // Reset transactions that used this category
    await prisma.transaction.updateMany({
      where: { categoryId: id },
      data: { categoryId: null, category: 'Khác' }
    });

    res.json({ success: true, message: 'Đã xoá danh mục' });
  } catch (error) {
    next(error);
  }
};
