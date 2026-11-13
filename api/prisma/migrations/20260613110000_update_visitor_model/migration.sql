-- Drop old visitor relation/index
DROP INDEX IF EXISTS "Visitor_residentId_idx";
ALTER TABLE "Visitor" DROP CONSTRAINT IF EXISTS "Visitor_residentId_fkey";

-- Add new columns as nullable first for data backfill compatibility
ALTER TABLE "Visitor"
  ADD COLUMN "condominiumId" TEXT,
  ADD COLUMN "fullName" TEXT,
  ADD COLUMN "unit" TEXT,
  ADD COLUMN "authorizedBy" TEXT,
  ADD COLUMN "emailEncrypted" TEXT,
  ADD COLUMN "phoneEncrypted" TEXT,
  ADD COLUMN "documentEncrypted" TEXT,
  ADD COLUMN "observationsEncrypted" TEXT,
  ADD COLUMN "createdByUserId" TEXT;

-- Backfill legacy visitor records from related resident, when available
UPDATE "Visitor" v
SET
  "condominiumId" = r."condominiumId",
  "fullName" = r."fullName",
  "unit" = r."unit",
  "authorizedBy" = 'Portaria',
  "emailEncrypted" = r."emailEncrypted",
  "phoneEncrypted" = r."phoneEncrypted",
  "documentEncrypted" = COALESCE(r."documentEncrypted", 'legacy-no-document')
FROM "Resident" r
WHERE v."residentId" = r."id";

-- Ensure required fields for any orphan legacy row
UPDATE "Visitor"
SET
  "condominiumId" = COALESCE("condominiumId", 'legacy-default-condominium'),
  "fullName" = COALESCE("fullName", 'Visitante legado'),
  "unit" = COALESCE("unit", 'N/A'),
  "authorizedBy" = COALESCE("authorizedBy", 'Portaria'),
  "documentEncrypted" = COALESCE("documentEncrypted", 'legacy-no-document')
WHERE
  "condominiumId" IS NULL
  OR "fullName" IS NULL
  OR "unit" IS NULL
  OR "authorizedBy" IS NULL
  OR "documentEncrypted" IS NULL;

-- Enforce required visitor columns
ALTER TABLE "Visitor"
  ALTER COLUMN "condominiumId" SET NOT NULL,
  ALTER COLUMN "fullName" SET NOT NULL,
  ALTER COLUMN "unit" SET NOT NULL,
  ALTER COLUMN "authorizedBy" SET NOT NULL,
  ALTER COLUMN "documentEncrypted" SET NOT NULL;

-- Remove old column
ALTER TABLE "Visitor" DROP COLUMN "residentId";

-- New indexes
CREATE INDEX "Visitor_condominiumId_fullName_idx" ON "Visitor"("condominiumId", "fullName");
CREATE INDEX "Visitor_condominiumId_unit_idx" ON "Visitor"("condominiumId", "unit");
CREATE INDEX "Visitor_createdByUserId_idx" ON "Visitor"("createdByUserId");
CREATE INDEX "Visitor_createdAt_idx" ON "Visitor"("createdAt");

-- New foreign keys
ALTER TABLE "Visitor"
ADD CONSTRAINT "Visitor_condominiumId_fkey"
FOREIGN KEY ("condominiumId") REFERENCES "Condominium"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Visitor"
ADD CONSTRAINT "Visitor_createdByUserId_fkey"
FOREIGN KEY ("createdByUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
