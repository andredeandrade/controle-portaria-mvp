-- CreateTable
CREATE TABLE "ResidentUnit" (
    "id" TEXT NOT NULL,
    "residentId" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResidentUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResidentUnit_residentId_unit_key" ON "ResidentUnit"("residentId", "unit");

-- CreateIndex
CREATE INDEX "ResidentUnit_residentId_idx" ON "ResidentUnit"("residentId");

-- CreateIndex
CREATE INDEX "ResidentUnit_unit_idx" ON "ResidentUnit"("unit");

-- AddForeignKey
ALTER TABLE "ResidentUnit" ADD CONSTRAINT "ResidentUnit_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copia a unidade atual de cada morador para a nova tabela
INSERT INTO "ResidentUnit" ("id", "residentId", "unit", "position", "createdAt")
SELECT gen_random_uuid()::text, "id", TRIM("unit"), 0, "createdAt"
FROM "Resident"
WHERE "unit" IS NOT NULL AND TRIM("unit") <> '';

-- DropIndex
DROP INDEX "Resident_condominiumId_unit_idx";

-- AlterTable
ALTER TABLE "Resident" DROP COLUMN "unit";
