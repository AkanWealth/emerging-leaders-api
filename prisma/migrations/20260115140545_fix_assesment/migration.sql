-- AlterTable
ALTER TABLE "UserAssessment" ADD COLUMN     "intervalIndex" INTEGER,
ADD COLUMN     "nextScheduledFor" TIMESTAMP(3);
