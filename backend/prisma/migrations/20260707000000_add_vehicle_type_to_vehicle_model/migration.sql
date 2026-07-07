-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'MOTO', 'TRUCK', 'AGRI');

-- AlterTable
ALTER TABLE "VehicleModel" ADD COLUMN "vehicleType" "VehicleType" NOT NULL DEFAULT 'CAR';

-- Backfill existing rows explicitly so the column is stable if defaults change later.
UPDATE "VehicleModel" SET "vehicleType" = 'CAR' WHERE "vehicleType" IS NULL;