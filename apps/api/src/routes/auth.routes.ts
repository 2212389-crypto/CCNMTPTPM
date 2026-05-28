import { Router } from "express";
import { authRequired } from "../middlewares/auth";
import { trackActivity } from "../middlewares/activity-tracker";
import { login, register, me, logout } from "../controllers/auth.controller";

const r = Router();

// POST /auth/login
// POST /auth/login
r.post("/login", trackActivity("login", "Đăng nhập hệ thống"), login);

// POST /auth/register 
r.post("/register", register);

// GET /auth/me
r.get("/me", authRequired, me);

// POST /auth/logout
r.post("/logout", authRequired, trackActivity("logout", "Đăng xuất hệ thống"), logout);

export default r;
