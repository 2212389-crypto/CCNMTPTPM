import { Router } from "express";
import { z } from "zod";
import { authRequired } from "../middlewares/auth";
import { trackActivity } from "../middlewares/activity-tracker";
import { listTransactions, createTransaction, updateTransaction, deleteTransaction } from "../controllers/transactions.controller";

const r = Router();

const TxCreate = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().positive(),
  occurredAt: z.string().datetime(),
  accountId: z.string(),
  note: z.string().optional(),
  categoryId: z.string().optional().nullable(),
});
const TxUpdate = TxCreate.partial();

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Danh sách giao dịch
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           example: occurredAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 */
r.get("/", authRequired, trackActivity("transaction", "Truy cập danh sách giao dịch"), listTransactions);

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Tạo giao dịch
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TxCreate' }
 *     responses:
 *       201: { description: Created }
 */
r.post("/", authRequired, trackActivity("transaction", "Tạo giao dịch mới"), createTransaction);

/**
 * @swagger
 * /transactions/{id}:
 *   patch:
 *     summary: Cập nhật giao dịch
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/TxUpdate' }
 *     responses:
 *       200: { description: OK }
 */
r.patch("/:id", authRequired, trackActivity("transaction", "Cập nhật giao dịch"), updateTransaction);

/**
 * @swagger
 * /transactions/{id}:
 *   delete:
 *     summary: Xoá giao dịch
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: No Content }
 */
r.delete("/:id", authRequired, trackActivity("transaction", "Xóa giao dịch"), deleteTransaction);

export default r;
