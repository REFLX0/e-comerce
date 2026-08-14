-- Provenance for technical lubricant data (admin-only).
CREATE TABLE "ProductSourcing" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "sourceTitle" TEXT,
    "evidence" TEXT,
    "derivedValueNotes" TEXT,
    "confidence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductSourcing_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductSourcing_productId_key" ON "ProductSourcing"("productId");

ALTER TABLE "ProductSourcing"
  ADD CONSTRAINT "ProductSourcing_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- A deduplicated application-level write window is used for these records;
-- the index keeps that lookup efficient while allowing a query to recur later.
CREATE TABLE "UnmatchedVehicleQuery" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "engineCode" TEXT,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "requiredSpecification" TEXT,
    "source" TEXT NOT NULL DEFAULT 'user_search',
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UnmatchedVehicleQuery_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UnmatchedVehicleQuery_make_model_engineCode_createdAt_idx"
  ON "UnmatchedVehicleQuery"("make", "model", "engineCode", "createdAt");
