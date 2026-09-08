-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "technicalCharacteristics" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "compatibleVehiclesNote" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "ProductOemReference" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductOemReference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProductOemReference_productId_idx" ON "ProductOemReference"("productId");

-- AddForeignKey
DO $$ BEGIN
    ALTER TABLE "ProductOemReference" ADD CONSTRAINT "ProductOemReference_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
