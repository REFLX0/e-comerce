-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PriceImportStatus" AS ENUM ('PREVIEW', 'APPLIED', 'ROLLED_BACK');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PriceImportItemStatus" AS ENUM ('MATCHED', 'NOT_FOUND', 'AMBIGUOUS', 'DUPLICATE', 'INVALID_PRICE', 'APPLIED', 'SKIPPED', 'ROLLED_BACK');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "PriceImport" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileUrl" TEXT,
    "supplier" TEXT,
    "parserKey" TEXT NOT NULL,
    "status" "PriceImportStatus" NOT NULL DEFAULT 'PREVIEW',
    "uploadedById" TEXT,
    "appliedById" TEXT,
    "rolledBackById" TEXT,
    "detectedCount" INTEGER NOT NULL DEFAULT 0,
    "matchedCount" INTEGER NOT NULL DEFAULT 0,
    "unmatchedCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateCount" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "appliedAt" TIMESTAMP(3),
    "rolledBackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "PriceImportItem" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "articleNumber" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "newSupplierPrice" DOUBLE PRECISION,
    "newSellingPrice" DOUBLE PRECISION,
    "productId" TEXT,
    "variantId" TEXT,
    "oldSellingPrice" DOUBLE PRECISION,
    "oldSupplierPrice" DOUBLE PRECISION,
    "changePercent" DOUBLE PRECISION,
    "status" "PriceImportItemStatus" NOT NULL,
    "isSuspicious" BOOLEAN NOT NULL DEFAULT false,
    "warning" TEXT,
    "selected" BOOLEAN NOT NULL DEFAULT true,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "PriceImportItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PriceImport_status_createdAt_idx" ON "PriceImport"("status", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PriceImportItem_importId_idx" ON "PriceImportItem"("importId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PriceImportItem_articleNumber_idx" ON "PriceImportItem"("articleNumber");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "PriceImport" ADD CONSTRAINT "PriceImport_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "PriceImport" ADD CONSTRAINT "PriceImport_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "PriceImport" ADD CONSTRAINT "PriceImport_rolledBackById_fkey" FOREIGN KEY ("rolledBackById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "PriceImportItem" ADD CONSTRAINT "PriceImportItem_importId_fkey" FOREIGN KEY ("importId") REFERENCES "PriceImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "PriceImportItem" ADD CONSTRAINT "PriceImportItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "PriceImportItem" ADD CONSTRAINT "PriceImportItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
