-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "occurrenceType" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "reportEncrypted" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Incident_condominiumId_date_idx" ON "Incident"("condominiumId", "date");

-- CreateIndex
CREATE INDEX "Incident_condominiumId_occurrenceType_idx" ON "Incident"("condominiumId", "occurrenceType");

-- CreateIndex
CREATE INDEX "Incident_createdByUserId_idx" ON "Incident"("createdByUserId");

-- CreateIndex
CREATE INDEX "Incident_createdAt_idx" ON "Incident"("createdAt");

-- AddForeignKey
ALTER TABLE "Incident"
ADD CONSTRAINT "Incident_condominiumId_fkey"
FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident"
ADD CONSTRAINT "Incident_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
