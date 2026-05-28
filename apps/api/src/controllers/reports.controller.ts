import { Request, Response } from 'express';

export const getMonthlySummary = async (req: Request, res: Response) => {
  const year = Number(req.query.year ?? new Date().getFullYear());
  const userId = (req as any).user?.userId;

  // Import transactions từ transactions controller để tính toán
  const { getMockTransactions } = require('./transactions.controller');
  const transactions = getMockTransactions(userId);

  // Tính tổng theo tháng từ transactions thật
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthTransactions = transactions.filter((t: any) => {
      const transactionDate = new Date(t.occurredAt);
      return transactionDate.getFullYear() === year && transactionDate.getMonth() + 1 === month;
    });

    const income = monthTransactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const expense = monthTransactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    return { month, income, expense };
  });

  res.json(monthlyData);
};
