/*
  Warnings:

  - You are about to drop the column `jiro` on the `Evaluation` table. All the data in the column will be lost.
  - Added the required column `jirodo` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "jiro",
ADD COLUMN     "jirodo" INTEGER NOT NULL;
