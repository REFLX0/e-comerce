-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('ESSENCE', 'DIESEL');

-- AlterTable
ALTER TABLE "ProductSpecs" ADD COLUMN     "fuelTypes" "FuelType"[],
ADD COLUMN     "maxCylinders" INTEGER,
ADD COLUMN     "maxPower" DOUBLE PRECISION,
ADD COLUMN     "minCylinders" INTEGER,
ADD COLUMN     "minPower" DOUBLE PRECISION,
ADD COLUMN     "vehicleTypes" "VehicleType"[];
