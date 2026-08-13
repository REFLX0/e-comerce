-- CreateTable
CREATE TABLE "UserCar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "plateNumber" TEXT,
    "currentMileage" INTEGER NOT NULL DEFAULT 0,
    "lastOilChangeMileage" INTEGER NOT NULL DEFAULT 0,
    "oilChangeIntervalKm" INTEGER NOT NULL DEFAULT 10000,
    "oilChangeDone" BOOLEAN NOT NULL DEFAULT false,
    "oilFilterChanged" BOOLEAN NOT NULL DEFAULT false,
    "airFilterChanged" BOOLEAN NOT NULL DEFAULT false,
    "cabinFilterChanged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserCar_userId_idx" ON "UserCar"("userId");

-- AddForeignKey
ALTER TABLE "UserCar" ADD CONSTRAINT "UserCar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
