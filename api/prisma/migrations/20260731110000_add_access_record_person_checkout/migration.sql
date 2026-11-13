-- AlterTable
ALTER TABLE "AccessRecordPerson"
ADD COLUMN "checkOutObservationsEncrypted" TEXT,
ADD COLUMN "checkOutAt" TIMESTAMP(3),
ADD COLUMN "checkedOutByUserId" TEXT;

-- CreateIndex
CREATE INDEX "AccessRecordPerson_checkOutAt_idx" ON "AccessRecordPerson"("checkOutAt");

-- CreateIndex
CREATE INDEX "AccessRecordPerson_checkedOutByUserId_idx" ON "AccessRecordPerson"("checkedOutByUserId");

-- AddForeignKey
ALTER TABLE "AccessRecordPerson"
ADD CONSTRAINT "AccessRecordPerson_checkedOutByUserId_fkey"
FOREIGN KEY ("checkedOutByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
