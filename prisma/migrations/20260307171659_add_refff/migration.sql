-- AlterTable
ALTER TABLE `Referral` ADD COLUMN `orderId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Referral_orderId_idx` ON `Referral`(`orderId`);

-- AddForeignKey
ALTER TABLE `Referral` ADD CONSTRAINT `Referral_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
