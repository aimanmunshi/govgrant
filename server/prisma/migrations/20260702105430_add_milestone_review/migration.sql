/*
  Warnings:

  - A unique constraint covering the columns `[milestoneId,reviewerId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `milestoneId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Review_proposalId_reviewerId_key` ON `review`;

-- AlterTable
ALTER TABLE `review` ADD COLUMN `milestoneId` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Review_milestoneId_reviewerId_key` ON `Review`(`milestoneId`, `reviewerId`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_milestoneId_fkey` FOREIGN KEY (`milestoneId`) REFERENCES `Milestone`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
