import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { HttpError } from '../../infra/errors';
import { prisma } from '../services/database.service';

const createAccountSchema = z.object({
  name: z.string().min(2),
  currency: z.string().default('VND')
});

export const listAccounts = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || '1';
  console.log('=== LIST ACCOUNTS ===');
  console.log('User ID:', userId);
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const q = req.query.q as string || '';
  
  try {
    // Get accounts from database
    const accounts = await prisma.account.findMany({
      where: {
        ownerId: userId,
        ...(q && {
          name: {
            contains: q,
            mode: 'insensitive'
          }
        })
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('User accounts count:', accounts.length);
    
    // Pagination
    const total = accounts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const items = accounts.slice(startIndex, endIndex);
    
    res.json({
      items,
      meta: {
        page,
        limit,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId || '1';
    
    const { name, currency } = createAccountSchema.parse(req.body);
    
    // Check if account name already exists for this user
    const existingAccount = await prisma.account.findFirst({
      where: {
        ownerId: userId,
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });
    
    if (existingAccount) {
      return next(new HttpError(400, 'Tên tài khoản đã tồn tại'));
    }
    
    const newAccount = await prisma.account.create({
      data: {
        name,
        type: 'Tài khoản',
        currency,
        balance: 0,
        ownerId: userId
      }
    });
    
    res.status(201).json(newAccount);
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId || '1';
    const { id } = req.params;
    
    // Check if account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });
    
    if (!account) {
      return next(new HttpError(404, 'Không tìm thấy tài khoản'));
    }
    
    // Delete the account
    await prisma.account.delete({
      where: { id }
    });
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
