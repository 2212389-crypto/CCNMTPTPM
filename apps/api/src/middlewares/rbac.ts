import { Request, Response, NextFunction } from "express";
export const allow = (...roles: ("ADMIN"|"USER")[]) => (req: Request, res: Response, next: NextFunction) => {
  const u = (req as any).user as { role?: string };
  if (!u || !roles.includes(u.role as any)) return res.status(403).json({ message: "Forbidden" });
  next();
};
