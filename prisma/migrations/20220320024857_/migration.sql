-- AlterTable
ALTER TABLE `accounts` MODIFY `expiration_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
