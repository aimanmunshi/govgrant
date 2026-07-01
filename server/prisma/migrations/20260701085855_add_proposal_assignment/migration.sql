-- CreateTable
CREATE TABLE `ProposalAssignment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `proposalId` INTEGER NOT NULL,
    `reviewerId` INTEGER NOT NULL,

    UNIQUE INDEX `ProposalAssignment_proposalId_reviewerId_key`(`proposalId`, `reviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProposalAssignment` ADD CONSTRAINT `ProposalAssignment_proposalId_fkey` FOREIGN KEY (`proposalId`) REFERENCES `Proposal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProposalAssignment` ADD CONSTRAINT `ProposalAssignment_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
