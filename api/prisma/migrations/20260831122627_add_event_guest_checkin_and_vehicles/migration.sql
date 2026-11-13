-- AlterTable
ALTER TABLE "EventGuest" ADD COLUMN     "checkInAt" TIMESTAMP(3),
ADD COLUMN     "checkOutAt" TIMESTAMP(3),
ADD COLUMN     "checkedInByUserId" TEXT,
ADD COLUMN     "checkedOutByUserId" TEXT;

-- CreateTable
CREATE TABLE "EventVehicle" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "plateEncrypted" TEXT,
    "brandModel" TEXT,
    "driverName" TEXT,
    "color" TEXT,
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutAt" TIMESTAMP(3),
    "checkedInByUserId" TEXT,
    "checkedOutByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventVehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventVehicle_eventId_idx" ON "EventVehicle"("eventId");

-- CreateIndex
CREATE INDEX "EventVehicle_checkInAt_idx" ON "EventVehicle"("checkInAt");

-- CreateIndex
CREATE INDEX "EventVehicle_checkOutAt_idx" ON "EventVehicle"("checkOutAt");

-- CreateIndex
CREATE INDEX "EventVehicle_checkedInByUserId_idx" ON "EventVehicle"("checkedInByUserId");

-- CreateIndex
CREATE INDEX "EventVehicle_checkedOutByUserId_idx" ON "EventVehicle"("checkedOutByUserId");

-- CreateIndex
CREATE INDEX "EventGuest_checkInAt_idx" ON "EventGuest"("checkInAt");

-- CreateIndex
CREATE INDEX "EventGuest_checkOutAt_idx" ON "EventGuest"("checkOutAt");

-- CreateIndex
CREATE INDEX "EventGuest_checkedInByUserId_idx" ON "EventGuest"("checkedInByUserId");

-- CreateIndex
CREATE INDEX "EventGuest_checkedOutByUserId_idx" ON "EventGuest"("checkedOutByUserId");

-- AddForeignKey
ALTER TABLE "EventGuest" ADD CONSTRAINT "EventGuest_checkedInByUserId_fkey" FOREIGN KEY ("checkedInByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGuest" ADD CONSTRAINT "EventGuest_checkedOutByUserId_fkey" FOREIGN KEY ("checkedOutByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVehicle" ADD CONSTRAINT "EventVehicle_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVehicle" ADD CONSTRAINT "EventVehicle_checkedInByUserId_fkey" FOREIGN KEY ("checkedInByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVehicle" ADD CONSTRAINT "EventVehicle_checkedOutByUserId_fkey" FOREIGN KEY ("checkedOutByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
