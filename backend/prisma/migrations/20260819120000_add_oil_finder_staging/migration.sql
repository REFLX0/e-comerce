-- CreateTable
CREATE TABLE "OilFinderOilSpec" (
    "id" TEXT NOT NULL,
    "viscosity" TEXT NOT NULL,
    "apiStandard" TEXT,
    "aceaStandard" TEXT,
    "oemApproval" TEXT,
    "capacityLiters" DOUBLE PRECISION,
    "changeIntervalKm" INTEGER,
    "fingerprint" TEXT NOT NULL,

    CONSTRAINT "OilFinderOilSpec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OilFinderOilSpec_fingerprint_key" ON "OilFinderOilSpec"("fingerprint");

-- CreateTable
CREATE TABLE "OilFinderVehicle" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "generation" TEXT NOT NULL DEFAULT '',
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "engineCode" TEXT NOT NULL DEFAULT '',
    "displacementCc" INTEGER,
    "powerKw" INTEGER,
    "powerHp" INTEGER,
    "fuelType" TEXT NOT NULL,
    "oilSpecId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "confidence" TEXT NOT NULL,
    "matchAmbiguity" JSONB,

    CONSTRAINT "OilFinderVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OilFinderVehicle_make_model_generation_engineCode_source_key" ON "OilFinderVehicle"("make","model","generation","engineCode","source");

-- CreateIndex
CREATE INDEX "OilFinderVehicle_make_model_engineCode_idx" ON "OilFinderVehicle"("make","model","engineCode");

-- CreateIndex
CREATE INDEX "OilFinderVehicle_displacementCc_powerHp_fuelType_idx" ON "OilFinderVehicle"("displacementCc","powerHp","fuelType");

-- AddForeignKey
ALTER TABLE "OilFinderVehicle" ADD CONSTRAINT "OilFinderVehicle_oilSpecId_fkey" FOREIGN KEY ("oilSpecId") REFERENCES "OilFinderOilSpec"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "OilFinderLookupConflict" (
    "id" TEXT NOT NULL,
    "displacementCc" INTEGER NOT NULL,
    "powerHp" INTEGER NOT NULL,
    "fuelType" TEXT NOT NULL,
    "highestSeverity" TEXT NOT NULL,
    "fieldSeverities" JSONB NOT NULL,
    "candidateCount" INTEGER NOT NULL,
    "rawReport" JSONB,

    CONSTRAINT "OilFinderLookupConflict_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OilFinderLookupConflict_displacementCc_powerHp_fuelType_key" ON "OilFinderLookupConflict"("displacementCc","powerHp","fuelType");
