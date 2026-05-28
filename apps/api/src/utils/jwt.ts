import jwt from "jsonwebtoken";
export type JwtUser = { id: string; role: "ADMIN" | "USER" };
export const signAccess = (u: JwtUser) => jwt.sign(u, process.env.JWT_ACCESS_SECRET!, { expiresIn: "15m" });
export const verifyAccess = (t: string) => jwt.verify(t, process.env.JWT_ACCESS_SECRET!) as JwtUser;
export const signRefresh = (u: JwtUser) => jwt.sign(u, process.env.JWT_REFRESH_SECRET!, { expiresIn: "7d" });
