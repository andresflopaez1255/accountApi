/*
  Warnings:

  - Added the required column `expiration_date` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `accounts` ADD COLUMN `expiration_date` DATETIME(3) NOT NULL;
