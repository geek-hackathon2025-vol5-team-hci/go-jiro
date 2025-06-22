/*
  Warnings:

  - You are about to drop the column `jiro_difficulty` on the `Evaluation` table. All the data in the column will be lost.
  - Added the required column `jiro` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "jiro_difficulty",
ADD COLUMN     "jiro" INTEGER NOT NULL;
