/*
  Warnings:

  - You are about to drop the column `facultyId` on the `attendances` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `attendances` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "attendances" DROP CONSTRAINT "attendances_subjectId_fkey";

-- DropIndex
DROP INDEX "attendances_facultyId_idx";

-- DropIndex
DROP INDEX "attendances_studentId_subjectId_date_key";

-- DropIndex
DROP INDEX "attendances_subjectId_idx";

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "facultyId",
DROP COLUMN "subjectId",
ADD COLUMN     "markedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_date_key" ON "attendances"("studentId", "date");
