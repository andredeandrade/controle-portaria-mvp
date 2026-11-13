-- CreateTable
CREATE TABLE "AccessRecord" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "company" TEXT,
    "locomotion" TEXT,
    "color" TEXT,
    "plateEncrypted" TEXT,
    "brandModel" TEXT,
    "observationsEncrypted" TEXT,
    "checkOutObservationsEncrypted" TEXT,
    "checkInAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutAt" TIMESTAMP(3),
    "checkedInByUserId" TEXT,
    "checkedOutByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessRecordPerson" (
    "id" TEXT NOT NULL,
    "accessRecordId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "documentEncrypted" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccessRecordPerson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccessRecord_condominiumId_checkInAt_idx" ON "AccessRecord"("condominiumId", "checkInAt");

-- CreateIndex
CREATE INDEX "AccessRecord_condominiumId_checkOutAt_idx" ON "AccessRecord"("condominiumId", "checkOutAt");

-- CreateIndex
CREATE INDEX "AccessRecord_checkedInByUserId_idx" ON "AccessRecord"("checkedInByUserId");

-- CreateIndex
CREATE INDEX "AccessRecord_checkedOutByUserId_idx" ON "AccessRecord"("checkedOutByUserId");

-- CreateIndex
CREATE INDEX "AccessRecord_createdAt_idx" ON "AccessRecord"("createdAt");

-- CreateIndex
CREATE INDEX "AccessRecordPerson_accessRecordId_idx" ON "AccessRecordPerson"("accessRecordId");

-- CreateIndex
CREATE INDEX "AccessRecordPerson_category_idx" ON "AccessRecordPerson"("category");

-- CreateIndex
CREATE INDEX "AccessRecordPerson_name_idx" ON "AccessRecordPerson"("name");

-- AddForeignKey
ALTER TABLE "AccessRecord"
ADD CONSTRAINT "AccessRecord_condominiumId_fkey"
FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRecord"
ADD CONSTRAINT "AccessRecord_checkedInByUserId_fkey"
FOREIGN KEY ("checkedInByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRecord"
ADD CONSTRAINT "AccessRecord_checkedOutByUserId_fkey"
FOREIGN KEY ("checkedOutByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessRecordPerson"
ADD CONSTRAINT "AccessRecordPerson_accessRecordId_fkey"
FOREIGN KEY ("accessRecordId") REFERENCES "AccessRecord"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
