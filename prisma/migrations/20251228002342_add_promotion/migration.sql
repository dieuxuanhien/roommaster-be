/*
  Warnings:

  - Added the required column `baseAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountAmount` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseAmount` to the `TransactionDetail` table without a default value. This is not possible if the table is not empty.
  - Added the required column `discountAmount` to the `TransactionDetail` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "PromotionRule" AS ENUM ('ROOM_ONLY', 'EXTRAS_ONLY', 'ALL');

-- CreateEnum
CREATE TYPE "CustomerPromotionStatus" AS ENUM ('AVAILABLE', 'USED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "baseAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "amount" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TransactionDetail" ADD COLUMN     "baseAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL;

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "PromotionType" NOT NULL,
    "rule" "PromotionRule" NOT NULL DEFAULT 'ALL',
    "value" DECIMAL(10,2) NOT NULL,
    "maxDiscount" DECIMAL(10,2),
    "minBookingAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalQty" INTEGER,
    "remainingQty" INTEGER,
    "perCustomerLimit" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "disabledAt" TIMESTAMP(3),

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerPromotion" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "status" "CustomerPromotionStatus" NOT NULL DEFAULT 'AVAILABLE',
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionDetailId" TEXT,

    CONSTRAINT "CustomerPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsedPromotion" (
    "id" TEXT NOT NULL,
    "promotionId" TEXT NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "transactionDetailId" TEXT NOT NULL,
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsedPromotion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_code_key" ON "Promotion"("code");

-- AddForeignKey
ALTER TABLE "CustomerPromotion" ADD CONSTRAINT "CustomerPromotion_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPromotion" ADD CONSTRAINT "CustomerPromotion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerPromotion" ADD CONSTRAINT "CustomerPromotion_transactionDetailId_fkey" FOREIGN KEY ("transactionDetailId") REFERENCES "TransactionDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedPromotion" ADD CONSTRAINT "UsedPromotion_transactionDetailId_fkey" FOREIGN KEY ("transactionDetailId") REFERENCES "TransactionDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedPromotion" ADD CONSTRAINT "UsedPromotion_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsedPromotion" ADD CONSTRAINT "UsedPromotion_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
