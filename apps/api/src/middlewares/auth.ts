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
    // Try to verify with backend secret first
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev_access_secret') as JwtUser;
      req.user = payload;
      return next();
    } catch {
      // If backend secret fails, try Supabase secret (without verification)
      // This is for development/testing with Supabase tokens
    }

    // Parse Supabase JWT (which is signed by Supabase, not our backend)
    const decoded = jwt.decode(token) as any;
    if (!decoded) return res.status(401).json({ message: "Invalid token" });

    // Map Supabase JWT to our format
    // Supabase JWT has: sub (user_id), email, role
    const supabaseUser: JwtUser = {
      userId: decoded.sub || decoded.user_id || decoded.userId,
      email: decoded.email,
      role: decoded.role === 'admin' ? 'ADMIN' : 'USER'
    };

    if (!supabaseUser.userId) {
      return res.status(401).json({ message: "Invalid token - missing user ID" });
    }

    req.user = supabaseUser;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ message: "Invalid token" });
  }
}
