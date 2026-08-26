-- ExtendEnum
ALTER TYPE "StudySessionStatus" ADD VALUE IF NOT EXISTS 'CANCELED';

-- CreateEnum
CREATE TYPE "StudyPlanPeriodType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'CUSTOM');
CREATE TYPE "StudyPlanStatus" AS ENUM ('CONFIRMED', 'CANCELED');
CREATE TYPE "CalendarSyncStatus" AS ENUM ('NOT_REQUESTED', 'PENDING', 'SYNCED', 'FAILED');

-- AlterTable
ALTER TABLE "StudyPreference"
ADD COLUMN "studyOnWeekends" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "timeZone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
ADD COLUMN "syncWithGoogleDefault" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "StudyPlan"
ADD COLUMN "periodType" "StudyPlanPeriodType" NOT NULL DEFAULT 'DAILY',
ADD COLUMN "startDate" TIMESTAMP(3),
ADD COLUMN "endDate" TIMESTAMP(3),
ADD COLUMN "status" "StudyPlanStatus" NOT NULL DEFAULT 'CONFIRMED',
ADD COLUMN "syncWithGoogle" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "confirmedAt" TIMESTAMP(3);

ALTER TABLE "StudySession"
ADD COLUMN "studyContentId" TEXT,
ADD COLUMN "durationMinutes" INTEGER NOT NULL DEFAULT 40,
ADD COLUMN "syncStatus" "CalendarSyncStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
ADD COLUMN "syncError" TEXT;

-- Backfill existing confirmed plans without changing historical dates
UPDATE "StudyPlan" SET "startDate" = "planDate", "endDate" = "planDate", "confirmedAt" = "createdAt";

-- CreateTable
CREATE TABLE "StudyContent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "courseId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dueDate" TIMESTAMP(3),
  "importance" INTEGER NOT NULL DEFAULT 3,
  "estimatedMinutes" INTEGER NOT NULL DEFAULT 40,
  "studied" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudyContent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StudyContent_userId_studied_idx" ON "StudyContent"("userId", "studied");
CREATE INDEX "StudyContent_courseId_idx" ON "StudyContent"("courseId");
CREATE INDEX "StudySession_studyContentId_idx" ON "StudySession"("studyContentId");

ALTER TABLE "StudyContent" ADD CONSTRAINT "StudyContent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyContent" ADD CONSTRAINT "StudyContent_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "ClassroomCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_studyContentId_fkey" FOREIGN KEY ("studyContentId") REFERENCES "StudyContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
