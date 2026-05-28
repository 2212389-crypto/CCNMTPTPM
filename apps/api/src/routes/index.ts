import { Router } from "express";
import { authRequired } from "../middlewares/auth";
import auth from "./auth.routes";
import accounts from "./accounts.routes";
import transactions from "./transactions.routes";
import reports from "./reports.routes";
import users from "./users.routes";
import userActivities from "./user-activities.routes";
import seed from "./seed.routes";

const api = Router();

// Health check endpoint (no auth required)
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 */
api.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

api.use("/auth", auth);

// Public routes (no auth required)
api.use("/seed", seed); // Seed routes for database setup

// Protect all routes below with authentication
api.use(authRequired);

api.use("/accounts", accounts);
api.use("/transactions", transactions);
api.use("/reports", reports);
api.use("/users", users);
api.use("/user-activities", userActivities);

export default api;
