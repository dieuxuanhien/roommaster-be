/*
  Warnings:

  - You are about to drop the column `rule` on the `Promotion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "rule";

-- DropEnum
DROP TYPE "PromotionRule";
