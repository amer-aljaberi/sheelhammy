-- DropForeignKey
ALTER TABLE `Referral` DROP FOREIGN KEY `Referral_referrerId_fkey`;

-- AlterTable
ALTER TABLE `Referral` MODIFY `referrerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Referral` ADD CONSTRAINT `Referral_referrerId_fkey` FOREIGN KEY (`referrerId`) REFERENCES `Referrer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
