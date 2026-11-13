-- CreateEnum
CREATE TYPE "EventVehicleMovementType" AS ENUM ('CONVIDADO', 'DESEMBARQUE', 'BUSCA');

-- AlterTable
ALTER TABLE "EventGuest" ADD COLUMN     "entryVehicleId" TEXT,
ADD COLUMN     "exitVehicleId" TEXT,
ADD COLUMN     "isAdHoc" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "EventVehicle" ADD COLUMN     "driverDocumentEncrypted" TEXT,
ADD COLUMN     "movementType" "EventVehicleMovementType" NOT NULL DEFAULT 'CONVIDADO';

-- CreateIndex
CREATE INDEX "EventGuest_entryVehicleId_idx" ON "EventGuest"("entryVehicleId");

-- CreateIndex
CREATE INDEX "EventGuest_exitVehicleId_idx" ON "EventGuest"("exitVehicleId");

-- AddForeignKey
ALTER TABLE "EventGuest" ADD CONSTRAINT "EventGuest_entryVehicleId_fkey" FOREIGN KEY ("entryVehicleId") REFERENCES "EventVehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGuest" ADD CONSTRAINT "EventGuest_exitVehicleId_fkey" FOREIGN KEY ("exitVehicleId") REFERENCES "EventVehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
