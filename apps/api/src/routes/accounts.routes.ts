import { Router } from "express";
import { authRequired } from "../middlewares/auth";
import { listAccounts, createAccount, deleteAccount } from "../controllers/accounts.controller";
import { trackActivity } from "../middlewares/activity-tracker";
const r = Router();

/**
 * @openapi
 * /accounts:
 *   get:
 *     summary: Danh sách tài khoản
 *     tags: [Accounts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200: { description: OK }
 */
r.get("/", authRequired, trackActivity("account", "Truy cập danh sách tài khoản"), listAccounts);

/**
 * @openapi
 * /accounts:
 *   post:
 *     summary: Tạo tài khoản
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, currency]
 *             properties:
 *               name: { type: string, example: "Ví tiền mặt" }
 *               currency: { type: string, example: "VND" }
 *     responses:
 *       201: { description: Created }
 */
r.post("/", authRequired, trackActivity("account", "Tạo tài khoản mới"), createAccount);

/**
 * @openapi
 * /accounts/{id}:
 *   delete:
 *     summary: Xoá tài khoản
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted successfully }
 */
r.delete("/:id", authRequired, trackActivity("account", "Xóa tài khoản"), deleteAccount);

export default r;
