-- Add columns from lubricant-dataset.csv to ProductSpecs
ALTER TABLE "ProductSpecs"
  ADD COLUMN IF NOT EXISTS "jasoStandard" TEXT,
  ADD COLUMN IF NOT EXISTS "DPFCompatible" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "TurboCompatible" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "HybridCompatible" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "OEMApprovals" TEXT;
