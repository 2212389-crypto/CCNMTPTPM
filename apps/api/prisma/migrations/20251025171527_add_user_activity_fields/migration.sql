-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isCurrentlyActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "lastActivityType" TEXT;
