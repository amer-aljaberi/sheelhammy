/*
  Warnings:

  - You are about to drop the column `commissionRate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isReferrer` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `referrerCode` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Order` DROP FOREIGN KEY `Order_referrerId_fkey`;

-- DropIndex
DROP INDEX `User_referrerCode_idx` ON `User`;

-- DropIndex
DROP INDEX `User_referrerCode_key` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `commissionRate`,
    DROP COLUMN `isReferrer`,
    DROP COLUMN `referrerCode`;

-- CreateTable
CREATE TABLE `Referrer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `phoneCountryCode` VARCHAR(191) NULL DEFAULT '+962',
    `code` VARCHAR(191) NOT NULL,
    `commissionRate` DOUBLE NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `country` VARCHAR(191) NULL,
    `university` VARCHAR(191) NULL,
    `academicYear` VARCHAR(191) NULL,
    `grade` VARCHAR(191) NULL,
    `importantNotes` TEXT NULL,
    `notes` TEXT NULL,
    `sourceType` VARCHAR(191) NULL,
    `sourceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Referrer_code_key`(`code`),
    INDEX `Referrer_code_idx`(`code`),
    INDEX `Referrer_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReferrerPayment` (
    `id` VARCHAR(191) NOT NULL,
    `referrerId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentType` VARCHAR(191) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ReferrerPayment_referrerId_fkey`(`referrerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ReferrerPayment` ADD CONSTRAINT `ReferrerPayment_referrerId_fkey` FOREIGN KEY (`referrerId`) REFERENCES `Referrer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_referrerId_fkey` FOREIGN KEY (`referrerId`) REFERENCES `Referrer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
