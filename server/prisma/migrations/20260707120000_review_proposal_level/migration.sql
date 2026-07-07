-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_milestoneId_fkey`;
-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_proposalId_fkey`;
-- DropForeignKey
ALTER TABLE `review` DROP FOREIGN KEY `Review_reviewerId_fkey`;
-- DropIndex
DROP INDEX `Review_milestoneId_reviewerId_key` ON `review`;
-- AlterTable
ALTER TABLE `review` MODIFY `milestoneId` INTEGER NULL;
-- CreateIndex
CREATE UNIQUE INDEX `Review_proposalId_reviewerId_key` ON `Review`(`proposalId`, `reviewerId`);
-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_milestoneId_fkey` FOREIGN KEY (`milestoneId`) REFERENCES `Milestone`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
