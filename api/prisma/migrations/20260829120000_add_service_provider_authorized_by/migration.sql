-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN "authorizedBy" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ServiceProvider" ALTER COLUMN "authorizedBy" DROP DEFAULT;
