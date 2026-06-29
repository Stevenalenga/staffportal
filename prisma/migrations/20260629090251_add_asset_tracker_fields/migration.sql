-- AlterTable
ALTER TABLE `asset` ADD COLUMN `classification` VARCHAR(191) NULL,
    ADD COLUMN `invoiceNumber` VARCHAR(191) NULL,
    ADD COLUMN `paymentReference` VARCHAR(191) NULL,
    ADD COLUMN `staffInCharge` VARCHAR(191) NULL,
    ADD COLUMN `supplier` VARCHAR(191) NULL;
