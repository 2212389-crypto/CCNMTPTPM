import { Router } from "express";
import { authRequired } from "../middlewares/auth";
import { trackActivity } from "../middlewares/activity-tracker";
import { listCategories, getDefaultCategories, createCategory, deleteCategory } from "../controllers/categories.controller";

const r = Router();

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Danh sách danh mục của user
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE, TRANSFER]
 *     responses:
 *       200: { description: OK }
 */
r.get("/", authRequired, trackActivity("category", "Xem danh sách danh mục"), listCategories);

/**
 * @swagger
 * /categories/defaults:
 *   get:
 *     summary: Lấy danh mục mặc định
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE, TRANSFER]
 *           default: EXPENSE
 *     responses:
 *       200: { description: OK }
 */
r.get("/defaults", trackActivity("category", "Xem danh mục mặc định"), getDefaultCategories);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Tạo danh mục mới
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type]
 *             properties:
 *               name: { type: string, example: "Ăn uống" }
 *               type: { type: string, enum: [INCOME, EXPENSE, TRANSFER] }
 *     responses:
 *       201: { description: Created }
 */
r.post("/", authRequired, trackActivity("category", "Tạo danh mục mới"), createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Xoá danh mục
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Deleted }
 */
r.delete("/:id", authRequired, trackActivity("category", "Xoá danh mục"), deleteCategory);

export default r;
