-- AlterTable
ALTER TABLE `expense` ADD COLUMN `projectName` VARCHAR(191) NULL,
    ADD COLUMN `purpose` TEXT NULL;

-- CreateTable
CREATE TABLE `ExpenseLineItem` (
    `id` VARCHAR(191) NOT NULL,
    `expenseId` VARCHAR(191) NOT NULL,
    `itemDate` DATETIME(3) NULL,
    `specification` TEXT NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unitCost` DECIMAL(12, 2) NOT NULL,
    `cost` DECIMAL(12, 2) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExpenseLineItem` ADD CONSTRAINT `ExpenseLineItem_expenseId_fkey` FOREIGN KEY (`expenseId`) REFERENCES `Expense`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
