import { Router, Request, Response } from "express";
import { prisma } from "../services/database.service";
import * as bcrypt from "bcryptjs";

const router = Router();

// Endpoint để seed database manually
router.post("/admin-seed", async (req: Request, res: Response) => {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@example.com" }
    });

    if (existingAdmin) {
      return res.json({ 
        message: "Admin user already exists", 
        admin: { id: existingAdmin.id, email: existingAdmin.email, role: existingAdmin.role }
      });
    }

    // Create admin user
    const adminPass = await bcrypt.hash("admin12345", 10);
    const userPass = await bcrypt.hash("user12345", 10);

    const adminUser = await prisma.user.create({
      data: {
        email: "admin@example.com",
        fullName: "Administrator", 
        passwordHash: adminPass,
        role: "ADMIN"
      }
    });

    const normalUser = await prisma.user.create({
      data: {
        email: "user@example.com",
        fullName: "Test User",
        passwordHash: userPass, 
        role: "USER"
      }
    });

    res.json({
      message: "Seed completed successfully",
      users: [
        { id: adminUser.id, email: adminUser.email, role: adminUser.role },
        { id: normalUser.id, email: normalUser.email, role: normalUser.role }
      ]
    });
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ error: "Seed failed", details: error });
  }
});

// Endpoint để kiểm tra users trong database
router.get("/check-users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      count: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to check users", details: error });
  }
});

export default router;