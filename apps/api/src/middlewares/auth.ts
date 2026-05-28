import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type JwtUser = { userId: string; email: string; role: "ADMIN" | "USER" };
declare global {
  namespace Express {
    interface Request { user?: JwtUser }
  }
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_access_secret') as JwtUser;
    
    // Không cần kiểm tra user bị khóa nữa vì đã bỏ chức năng lock
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
