-- CreateTable
CREATE TABLE "Condominium" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Condominium_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Condominium_slug_key" ON "Condominium"("slug");

-- CreateIndex
CREATE INDEX "Condominium_name_idx" ON "Condominium"("name");

-- AddColumns (nullable first for data migration)
ALTER TABLE "User" ADD COLUMN "condominiumId" TEXT;
ALTER TABLE "Resident" ADD COLUMN "condominiumId" TEXT;

-- Create default condominium for legacy records
INSERT INTO "Condominium" ("id", "name", "slug", "updatedAt")
VALUES ('legacy-default-condominium', 'Condominio Padrão', 'condominio-padrao', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

-- Backfill legacy rows
UPDATE "User"
SET "condominiumId" = 'legacy-default-condominium'
WHERE "condominiumId" IS NULL;

UPDATE "Resident"
SET "condominiumId" = 'legacy-default-condominium'
WHERE "condominiumId" IS NULL;

-- Enforce required tenant column
ALTER TABLE "User" ALTER COLUMN "condominiumId" SET NOT NULL;
ALTER TABLE "Resident" ALTER COLUMN "condominiumId" SET NOT NULL;

-- Replace global unique by tenant-scoped unique
DROP INDEX IF EXISTS "User_email_key";
CREATE UNIQUE INDEX "User_condominiumId_email_key" ON "User"("condominiumId", "email");

-- New tenant-aware indexes for residents
DROP INDEX IF EXISTS "Resident_fullName_idx";
DROP INDEX IF EXISTS "Resident_unit_idx";
CREATE INDEX "Resident_condominiumId_fullName_idx" ON "Resident"("condominiumId", "fullName");
CREATE INDEX "Resident_condominiumId_unit_idx" ON "Resident"("condominiumId", "unit");
CREATE INDEX "User_condominiumId_idx" ON "User"("condominiumId");

-- AddForeignKey
ALTER TABLE "User"
ADD CONSTRAINT "User_condominiumId_fkey"
FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Resident"
ADD CONSTRAINT "Resident_condominiumId_fkey"
FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
