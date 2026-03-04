-- AlterTable
ALTER TABLE `Transfer` ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `orderId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Transfer_orderId_fkey` ON `Transfer`(`orderId`);

-- AddForeignKey
ALTER TABLE `Transfer` ADD CONSTRAINT `Transfer_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
