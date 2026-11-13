/*
  Warnings:

  - You are about to drop the column `unit` on the `AccessRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AccessRecord" DROP COLUMN "unit";

-- AlterTable
ALTER TABLE "AccessRecordPerson" ADD COLUMN     "unit" TEXT;
