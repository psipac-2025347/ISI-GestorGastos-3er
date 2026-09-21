-- CreateEnum
CREATE TYPE "FundMovementType" AS ENUM ('APORTE', 'RETIRO', 'GASTO_DIRECTO');

-- CreateTable
CREATE TABLE "emergency_fund_movements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movementType" "FundMovementType" NOT NULL,
    "sourceType" "IncomeType",
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "tax" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emergency_fund_movements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "emergency_fund_movements" ADD CONSTRAINT "emergency_fund_movements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
