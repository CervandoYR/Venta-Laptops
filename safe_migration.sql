-- Create ENUM types if they don't exist
DO $$ BEGIN
    CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TicketPaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Technician" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Technician_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "document" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- AlterTable Product
ALTER TABLE "Product" 
ADD COLUMN IF NOT EXISTS "originalPrice" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "warrantyMonths" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "specifications" JSONB;

-- AlterTable Order
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "shippingCountry" TEXT NOT NULL DEFAULT 'PE',
ALTER COLUMN "shippingAddress" SET DATA TYPE TEXT;

-- Drop foreign key constraint on Ticket.userId if it exists
DO $$ BEGIN
    ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_userId_fkey";
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Drop index on userId if it exists
DROP INDEX IF EXISTS "Ticket_userId_idx";

-- AlterTable Ticket
ALTER TABLE "Ticket" 
ADD COLUMN IF NOT EXISTS "clientId" TEXT,
ADD COLUMN IF NOT EXISTS "technicianId" TEXT,
ADD COLUMN IF NOT EXISTS "deviceType" TEXT,
ADD COLUMN IF NOT EXISTS "deviceBrand" TEXT,
ADD COLUMN IF NOT EXISTS "deviceModel" TEXT,
ADD COLUMN IF NOT EXISTS "deviceProcessor" TEXT,
ADD COLUMN IF NOT EXISTS "deviceRam" TEXT,
ADD COLUMN IF NOT EXISTS "deviceGpu" TEXT,
ADD COLUMN IF NOT EXISTS "deviceDisks" JSONB,
ADD COLUMN IF NOT EXISTS "devicePowerSupply" TEXT,
ADD COLUMN IF NOT EXISTS "deviceHasCharger" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "issueReported" TEXT,
ADD COLUMN IF NOT EXISTS "issueNotes" TEXT,
ADD COLUMN IF NOT EXISTS "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "paymentStatus" "TicketPaymentStatus" NOT NULL DEFAULT 'PENDING';

-- Optional: Drop old columns if you want to clean up, but we'll leave them to be safe.
-- ALTER TABLE "Ticket" DROP COLUMN IF EXISTS "userId";

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Ticket_clientId_idx" ON "Ticket"("clientId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Ticket_technicianId_idx" ON "Ticket"("technicianId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Ticket_status_idx" ON "Ticket"("status");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Technician"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
