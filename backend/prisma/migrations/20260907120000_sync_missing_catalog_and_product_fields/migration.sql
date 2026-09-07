-- AlterTable Product: add shortDescription
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "shortDescription" TEXT;

-- AlterTable ProductVariant: add costPrice, tecdocArticleId, supplierName, warehouse
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "costPrice" DOUBLE PRECISION;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "tecdocArticleId" INTEGER;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "supplierName" TEXT;
ALTER TABLE "ProductVariant" ADD COLUMN IF NOT EXISTS "warehouse" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_tecdocArticleId_key" ON "ProductVariant"("tecdocArticleId");

-- AlterTable User: add matriculeFisc
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "matriculeFisc" TEXT;

-- AlterTable Address: add street, address, postalCode, createdAt, updatedAt
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "street" TEXT;
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable UserCar
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "generation" TEXT;
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "fuelType" TEXT;
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "registrationPlate" TEXT;
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "annualMileage" INTEGER DEFAULT 15000;
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "lastOilChangeDate" TIMESTAMP(3);
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "oilCapacity" DOUBLE PRECISION;
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "recommendedOilVisc" TEXT;
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "recommendedOilSpec" TEXT;
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable VehicleGeneration
CREATE TABLE IF NOT EXISTS "VehicleGeneration" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" TEXT,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "imageUrl" TEXT,

    CONSTRAINT "VehicleGeneration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "VehicleGeneration_modelId_slug_key" ON "VehicleGeneration"("modelId", "slug");
CREATE INDEX IF NOT EXISTS "VehicleGeneration_modelId_idx" ON "VehicleGeneration"("modelId");

-- CreateTable VehicleEngine
CREATE TABLE IF NOT EXISTS "VehicleEngine" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "engineCode" TEXT NOT NULL,
    "displacementCc" INTEGER,
    "powerKw" DOUBLE PRECISION,
    "powerHp" DOUBLE PRECISION,
    "fuelType" TEXT NOT NULL,
    "oilSpecId" TEXT,

    CONSTRAINT "VehicleEngine_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "VehicleEngine_generationId_idx" ON "VehicleEngine"("generationId");
CREATE INDEX IF NOT EXISTS "VehicleEngine_engineCode_idx" ON "VehicleEngine"("engineCode");

-- AlterTable VehicleCompatibility: add generationId, engineId
ALTER TABLE "VehicleCompatibility" ADD COLUMN IF NOT EXISTS "generationId" TEXT;
ALTER TABLE "VehicleCompatibility" ADD COLUMN IF NOT EXISTS "engineId" TEXT;

-- Foreign Keys for Vehicle Hierarchy
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VehicleGeneration_modelId_fkey') THEN
    ALTER TABLE "VehicleGeneration" ADD CONSTRAINT "VehicleGeneration_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VehicleEngine_generationId_fkey') THEN
    ALTER TABLE "VehicleEngine" ADD CONSTRAINT "VehicleEngine_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "VehicleGeneration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VehicleEngine_oilSpecId_fkey') THEN
    ALTER TABLE "VehicleEngine" ADD CONSTRAINT "VehicleEngine_oilSpecId_fkey" FOREIGN KEY ("oilSpecId") REFERENCES "OilFinderOilSpec"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VehicleCompatibility_generationId_fkey') THEN
    ALTER TABLE "VehicleCompatibility" ADD CONSTRAINT "VehicleCompatibility_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "VehicleGeneration"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'VehicleCompatibility_engineId_fkey') THEN
    ALTER TABLE "VehicleCompatibility" ADD CONSTRAINT "VehicleCompatibility_engineId_fkey" FOREIGN KEY ("engineId") REFERENCES "VehicleEngine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AlterTable OrderItem: add tecdocArticleId
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "tecdocArticleId" INTEGER;

-- AlterTable OilFinderVehicle
ALTER TABLE "OilFinderVehicle" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'automobile';
ALTER TABLE "OilFinderVehicle" ADD COLUMN IF NOT EXISTS "hydraulicTransmissionOilType" TEXT;
ALTER TABLE "OilFinderVehicle" ADD COLUMN IF NOT EXISTS "hydraulicOilSpecOEM" TEXT;
ALTER TABLE "OilFinderVehicle" ADD COLUMN IF NOT EXISTS "hydraulicOilCapacityLiters" DOUBLE PRECISION;

-- Invoices & InvoiceLines
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceStatus') THEN
    CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "sequenceNumber" SERIAL,
    "invoiceNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "customerId" TEXT,
    "orderId" TEXT,
    "clientName" TEXT NOT NULL,
    "clientAddress" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "clientMf" TEXT,
    "notes" TEXT,
    "subtotalHT" DOUBLE PRECISION NOT NULL,
    "totalTVA" DOUBLE PRECISION NOT NULL,
    "totalTTC" DOUBLE PRECISION NOT NULL,
    "amountInWords" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_orderId_key" ON "Invoice"("orderId");
CREATE INDEX IF NOT EXISTS "Invoice_status_createdAt_idx" ON "Invoice"("status", "createdAt");

CREATE TABLE IF NOT EXISTS "InvoiceLine" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceHT" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.19,
    "vatAmount" DOUBLE PRECISION NOT NULL,
    "totalTTC" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "InvoiceLine_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_customerId_fkey') THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_orderId_fkey') THEN
    ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InvoiceLine_invoiceId_fkey') THEN
    ALTER TABLE "InvoiceLine" ADD CONSTRAINT "InvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
