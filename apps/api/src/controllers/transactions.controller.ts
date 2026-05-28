import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { HttpError } from '../../infra/errors';

// Mock transactions data cho development - phân biệt theo user
let mockTransactionsByUser: { [userId: string]: any[] } = {};
let transactionIdCounterByUser: { [userId: string]: number } = {};

// Initialize mock transactions cho user mới
const initMockTransactions = (userId: string) => {
  if (!mockTransactionsByUser[userId]) {
    mockTransactionsByUser[userId] = [];
    transactionIdCounterByUser[userId] = 1; // Mỗi user có counter riêng
  }
};

// Get next transaction ID for user
const getNextTransactionId = (userId: string): string => {
  initMockTransactions(userId);
  const nextId = transactionIdCounterByUser[userId]++;
  return `${userId}_tx_${nextId}`; // Format: userId_tx_1, userId_tx_2, etc.
};

// Export function để other controllers có thể sử dụng
export const getMockTransactions = (userId: string) => {
  initMockTransactions(userId);
  return mockTransactionsByUser[userId] || [];
};

const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive(),
  note: z.string().optional(),
  occurredAt: z.string(),
  accountId: z.string()
});

export const listTransactions = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId || '1';
  console.log('=== LIST TRANSACTIONS ===');
  console.log('User ID:', userId);
  console.log('All users data keys:', Object.keys(mockTransactionsByUser));
  const userTransactions = getMockTransactions(userId);
  console.log('User transactions count:', userTransactions.length);
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const q = req.query.q as string || '';
  
  // Filter by search query
  let filteredTransactions = userTransactions;
  if (q) {
    filteredTransactions = userTransactions.filter((transaction: any) => 
      transaction.note?.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  // Pagination
  const total = filteredTransactions.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = filteredTransactions.slice(startIndex, endIndex);
  
  res.json({
    items,
    meta: {
      page,
      limit,
      total
    }
  });
};

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId || '1';
    console.log('=== CREATE TRANSACTION ===');
    console.log('User ID:', userId);
    console.log('Request body:', req.body);
    const userTransactions = getMockTransactions(userId);
    
    const { type, amount, note, occurredAt, accountId } = createTransactionSchema.parse(req.body);
    
    const newTransaction = {
      id: getNextTransactionId(userId),
      type,
      amount,
      note: note || '',
      occurredAt,
      accountId,
      ownerId: userId,
      createdAt: new Date().toISOString()
    };
    
    userTransactions.push(newTransaction);
    
    res.status(201).json(newTransaction);
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId || '1';
    const userTransactions = getMockTransactions(userId);
    
    const { id } = req.params;
    const transactionIndex = userTransactions.findIndex((t: any) => t.id === id);
    
    if (transactionIndex === -1) {
      return next(new HttpError(404, 'Không tìm thấy giao dịch'));
    }
    
    const updateData = createTransactionSchema.partial().parse(req.body);
    const existingTransaction = userTransactions[transactionIndex];
    
    const updatedTransaction = {
      ...existingTransaction,
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    userTransactions[transactionIndex] = updatedTransaction;
    
    res.json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId || '1';
    const userTransactions = getMockTransactions(userId);
    
    const { id } = req.params;
    const transactionIndex = userTransactions.findIndex((t: any) => t.id === id);
    
    if (transactionIndex === -1) {
      return next(new HttpError(404, 'Không tìm thấy giao dịch'));
    }
    
    userTransactions.splice(transactionIndex, 1);
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
