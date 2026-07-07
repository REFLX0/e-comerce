-- Rename VehicleType enum values to match the dataset's French categories
ALTER TYPE "VehicleType" RENAME VALUE 'CAR' TO 'AUTOMOBILE';
ALTER TYPE "VehicleType" RENAME VALUE 'TRUCK' TO 'POIDS_LOURD';
ALTER TYPE "VehicleType" RENAME VALUE 'AGRI' TO 'AGRICOLE';
