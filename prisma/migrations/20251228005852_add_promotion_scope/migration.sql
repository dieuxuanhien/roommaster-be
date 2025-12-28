-- CreateEnum
CREATE TYPE "PromotionScope" AS ENUM ('ROOM', 'SERVICE', 'ALL');

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "scope" "PromotionScope" NOT NULL DEFAULT 'ALL';
