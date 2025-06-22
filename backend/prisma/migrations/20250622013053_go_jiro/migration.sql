/*
  Warnings:

  - You are about to drop the column `jirodo` on the `Evaluation` table. All the data in the column will be lost.
  - Added the required column `jiro_difficulty` to the `Evaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Evaluation" DROP COLUMN "jirodo",
ADD COLUMN     "jiro_difficulty" INTEGER NOT NULL;
