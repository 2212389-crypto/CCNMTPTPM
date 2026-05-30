import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { HttpError } from '../../infra/errors';
import { prisma } from '../services/database.service';

const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  amount: z.number().positive('Số tiền phải lớn hơn 0'),
  note: z.string().optional(),
  occurredAt: z.string().datetime('Ngày giao dịch không hợp lệ'),
  accountId: z.string().min(1, 'Vui lòng chọn tài khoản'),
  categoryId: z.string().optional().nullable(),
  category: z.string().optional().default('Khác')
});

const updateTransactionSchema = createTransactionSchema.partial();

/**
 * List transactions with pagination and filtering
 */
export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || 'occurredAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    const q = req.query.q as string || '';
    const typeFilter = req.query.type as string;

    // Build where clause
    const where: any = {
      userId,
      ...(q && {
        OR: [
          { note: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } }
        ]
      }),
      ...(typeFilter && typeFilter !== 'all' && { type: typeFilter })
    };

    // Get total count
    const total = await prisma.transaction.count({ where });

    // Get paginated data
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: { id: true, name: true, type: true }
        },
        category: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        [sortBy === 'amount' ? 'amount' : 'occurredAt']: sortOrder === 'asc' ? 'asc' : 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    res.json({
      items: transactions,
      meta: { page, limit, total }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new transaction and update account balance
 */
export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    const validatedData = createTransactionSchema.parse(req.body);
    const { type, amount, note, occurredAt, accountId, categoryId, category } = validatedData;

    // Verify account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, ownerId: userId }
    });

    if (!account) {
      return next(new HttpError(404, 'Không tìm thấy tài khoản'));
    }

    // Calculate balance change
    let balanceChange = 0;
    if (type === 'INCOME') {
      balanceChange = amount;
    } else if (type === 'EXPENSE') {
      balanceChange = -amount;
    } else if (type === 'TRANSFER') {
      balanceChange = 0; // Transfer doesn't change single account balance
    }

    // Create transaction in a transaction
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create transaction
      const newTransaction = await tx.transaction.create({
        data: {
          userId,
          accountId,
          type,
          amount,
          note: note || null,
          category,
          categoryId: categoryId || null,
          occurredAt: new Date(occurredAt)
        },
        include: {
          account: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } }
        }
      });

      // 2. Update account balance
      if (balanceChange !== 0) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: balanceChange
            }
          }
        });
      }

      return newTransaction;
    });

    res.status(201).json(transaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new HttpError(400, error.errors[0]?.message || 'Validation error'));
    }
    next(error);
  }
};

/**
 * Update transaction and adjust account balance
 */
export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    // Get existing transaction
    const existingTx = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTx) {
      return next(new HttpError(404, 'Không tìm thấy giao dịch'));
    }

    // Validate input
    const validatedData = updateTransactionSchema.parse(req.body);

    // Calculate balance adjustment if amount or type changed
    const oldBalanceChange = 
      existingTx.type === 'INCOME' ? existingTx.amount :
      existingTx.type === 'EXPENSE' ? -existingTx.amount : 0;

    const newBalanceChange = validatedData.type ? (
      validatedData.type === 'INCOME' ? validatedData.amount || existingTx.amount :
      validatedData.type === 'EXPENSE' ? -(validatedData.amount || existingTx.amount) : 0
    ) : oldBalanceChange;

    const balanceAdjustment = newBalanceChange - oldBalanceChange;

    // Update transaction and adjust balance
    const updatedTransaction = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          ...validatedData,
          occurredAt: validatedData.occurredAt ? new Date(validatedData.occurredAt) : undefined
        },
        include: {
          account: { select: { id: true, name: true } }
        }
      });

      // Adjust balance if needed
      if (balanceAdjustment !== 0) {
        await tx.account.update({
          where: { id: updated.accountId },
          data: {
            balance: { increment: balanceAdjustment }
          }
        });
      }

      return updated;
    });

    res.json(updatedTransaction);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new HttpError(400, error.errors[0]?.message || 'Validation error'));
    }
    next(error);
  }
};

/**
 * Delete transaction and reverse balance change
 */
export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    const { id } = req.params;

    if (!userId) {
      return next(new HttpError(401, 'Unauthorized'));
    }

    // Get transaction to delete
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!transaction) {
      return next(new HttpError(404, 'Không tìm thấy giao dịch'));
    }

    // Calculate balance to reverse
    const balanceReverse = 
      transaction.type === 'INCOME' ? -transaction.amount :
      transaction.type === 'EXPENSE' ? transaction.amount : 0;

    // Delete and reverse balance in transaction
    await prisma.$transaction(async (tx) => {
      // Delete transaction
      await tx.transaction.delete({ where: { id } });

      // Reverse balance if needed
      if (balanceReverse !== 0) {
        await tx.account.update({
          where: { id: transaction.accountId },
          data: {
            balance: { increment: balanceReverse }
          }
        });
      }
    });

    res.json({ success: true, message: 'Đã xoá giao dịch' });
  } catch (error) {
    next(error);
  }
};
