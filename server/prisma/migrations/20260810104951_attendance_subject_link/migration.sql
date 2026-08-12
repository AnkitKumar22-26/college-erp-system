/*
  Warnings:

  - You are about to drop the column `markedBy` on the `attendances` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studentId,subjectId,date]` on the table `attendances` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "attendances_studentId_date_key";

-- AlterTable
ALTER TABLE "attendances" DROP COLUMN "markedBy",
ADD COLUMN     "facultyId" TEXT,
ADD COLUMN     "subjectId" TEXT;

-- CreateIndex
CREATE INDEX "attendances_subjectId_idx" ON "attendances"("subjectId");

-- CreateIndex
CREATE INDEX "attendances_facultyId_idx" ON "attendances"("facultyId");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_studentId_subjectId_date_key" ON "attendances"("studentId", "subjectId", "date");

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;
