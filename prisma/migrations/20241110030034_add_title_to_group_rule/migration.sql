/*
  Warnings:

  - Added the required column `title` to the `groupRules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "groupRules" ADD COLUMN     "title" TEXT NOT NULL;
