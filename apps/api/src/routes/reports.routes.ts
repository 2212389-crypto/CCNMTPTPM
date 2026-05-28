import { Router } from "express";
import { authRequired } from "../middlewares/auth";
import { trackActivity } from "../middlewares/activity-tracker";
import { getMonthlySummary } from "../controllers/reports.controller";

const r = Router();

/**
 * @openapi
 * /reports/monthly-summary:
 *   get:
 *     summary: Tổng hợp thu/chi theo tháng
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema: { type: integer, example: 2025 }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   month: { type: integer }
 *                   income: { type: number }
 *                   expense: { type: number }
 */
r.get("/monthly-summary", authRequired, trackActivity("report", "Truy cập báo cáo tổng hợp tháng"), getMonthlySummary);

export default r;
