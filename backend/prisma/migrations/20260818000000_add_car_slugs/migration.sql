-- Add makeSlug and modelSlug to UserCar table
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "makeSlug" TEXT;
ALTER TABLE "UserCar" ADD COLUMN IF NOT EXISTS "modelSlug" TEXT;
