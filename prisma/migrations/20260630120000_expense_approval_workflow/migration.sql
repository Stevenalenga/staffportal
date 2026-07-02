-- Migrate legacy status values before enum change
UPDATE `Expense` SET `status` = 'FINANCE_APPROVED' WHERE `status` = 'UNDER_REVIEW';
UPDATE `Expense` SET `status` = 'DISBURSED' WHERE `status` = 'PAID';

-- Add workflow tracking columns
ALTER TABLE `Expense`
    ADD COLUMN `financeApprovedById` VARCHAR(191) NULL,
    ADD COLUMN `financeApprovedAt` DATETIME(3) NULL,
    ADD COLUMN `ceoApprovedById` VARCHAR(191) NULL,
    ADD COLUMN `ceoApprovedAt` DATETIME(3) NULL,
    ADD COLUMN `disbursedById` VARCHAR(191) NULL,
    ADD COLUMN `disbursedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectedById` VARCHAR(191) NULL,
    ADD COLUMN `rejectedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectionReason` TEXT NULL;

-- Preserve disbursement timestamps from legacy paidAt
UPDATE `Expense` SET `disbursedAt` = `paidAt` WHERE `paidAt` IS NOT NULL;

-- Remove legacy approval columns
ALTER TABLE `Expense` DROP FOREIGN KEY `Expense_approverId_fkey`;
ALTER TABLE `Expense`
    DROP COLUMN `approverId`,
    DROP COLUMN `approvedAt`,
    DROP COLUMN `paidAt`;

-- Update status enum for multi-stage workflow
ALTER TABLE `Expense` MODIFY `status` ENUM(
    'DRAFT',
    'SUBMITTED',
    'FINANCE_APPROVED',
    'APPROVED',
    'DISBURSED',
    'REJECTED'
) NOT NULL DEFAULT 'DRAFT';

-- Add foreign keys for approvers
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_financeApprovedById_fkey`
    FOREIGN KEY (`financeApprovedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Expense` ADD CONSTRAINT `Expense_ceoApprovedById_fkey`
    FOREIGN KEY (`ceoApprovedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Expense` ADD CONSTRAINT `Expense_disbursedById_fkey`
    FOREIGN KEY (`disbursedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
