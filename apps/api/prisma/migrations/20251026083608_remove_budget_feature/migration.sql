/*
  Warnings:

  - You are about to drop the `Budget` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Budget" DROP CONSTRAINT "Budget_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Budget" DROP CONSTRAINT "Budget_userId_fkey";

-- DropTable
DROP TABLE "public"."Budget";
