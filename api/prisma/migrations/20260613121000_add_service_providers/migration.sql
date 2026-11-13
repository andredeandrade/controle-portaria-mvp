-- CreateTable
CREATE TABLE "ServiceProvider" (
    "id" TEXT NOT NULL,
    "condominiumId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "unit" TEXT,
    "emailEncrypted" TEXT,
    "phoneEncrypted" TEXT,
    "documentEncrypted" TEXT NOT NULL,
    "observationsEncrypted" TEXT,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceProvider_condominiumId_companyName_idx" ON "ServiceProvider"("condominiumId", "companyName");

-- CreateIndex
CREATE INDEX "ServiceProvider_condominiumId_serviceType_idx" ON "ServiceProvider"("condominiumId", "serviceType");

-- CreateIndex
CREATE INDEX "ServiceProvider_createdByUserId_idx" ON "ServiceProvider"("createdByUserId");

-- CreateIndex
CREATE INDEX "ServiceProvider_createdAt_idx" ON "ServiceProvider"("createdAt");

-- AddForeignKey
ALTER TABLE "ServiceProvider"
ADD CONSTRAINT "ServiceProvider_condominiumId_fkey"
FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceProvider"
ADD CONSTRAINT "ServiceProvider_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
