-- CreateTable
CREATE TABLE "Authorization" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "authorizedName" TEXT NOT NULL,
    "personType" TEXT NOT NULL,
    "documentEncrypted" TEXT NOT NULL,
    "phoneEncrypted" TEXT,
    "company" TEXT,
    "unit" TEXT NOT NULL,
    "authorizedBy" TEXT NOT NULL,
    "validFromDate" TEXT NOT NULL,
    "validFromTime" TEXT NOT NULL,
    "validToDate" TEXT NOT NULL,
    "validToTime" TEXT NOT NULL,
    "observationsEncrypted" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Authorization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Authorization_condominiumId_authorizedName_idx" ON "Authorization"("condominiumId", "authorizedName");

-- CreateIndex
CREATE INDEX "Authorization_condominiumId_validFromDate_idx" ON "Authorization"("condominiumId", "validFromDate");

-- CreateIndex
CREATE INDEX "Authorization_condominiumId_validToDate_idx" ON "Authorization"("condominiumId", "validToDate");

-- CreateIndex
CREATE INDEX "Authorization_condominiumId_unit_idx" ON "Authorization"("condominiumId", "unit");

-- CreateIndex
CREATE INDEX "Authorization_createdByUserId_idx" ON "Authorization"("createdByUserId");

-- CreateIndex
CREATE INDEX "Authorization_createdAt_idx" ON "Authorization"("createdAt");

-- AddForeignKey
ALTER TABLE "Authorization"
ADD CONSTRAINT "Authorization_condominiumId_fkey"
FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Authorization"
ADD CONSTRAINT "Authorization_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
