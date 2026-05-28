import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("admin12345", 10);
  const userPass = await bcrypt.hash("user12345", 10);

  // Sửa theo schema của bạn
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: { email: "admin@example.com", fullName: "Admin", passwordHash: adminPass, role: "ADMIN" },
  });
  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: { email: "user@example.com", fullName: "User", passwordHash: userPass, role: "USER" },
  });
}

main().finally(() => prisma.$disconnect());
