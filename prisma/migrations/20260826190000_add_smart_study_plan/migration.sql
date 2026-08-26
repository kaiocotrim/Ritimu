-- AlterTable
ALTER TABLE "ClassroomAssignment"
ADD COLUMN "importance" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "estimatedMinutes" INTEGER NOT NULL DEFAULT 40;

-- CreateEnum
CREATE TYPE "StudySessionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'RESCHEDULED');

-- CreateTable
CREATE TABLE "StudyPreference" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL,
  "defaultSessionMinutes" INTEGER NOT NULL DEFAULT 40,
  "breakMinutes" INTEGER NOT NULL DEFAULT 10,
  "maxDailyMinutes" INTEGER NOT NULL DEFAULT 120,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudyPreference_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudyPreference_userId_key" ON "StudyPreference"("userId");

CREATE TABLE "StudyAvailability" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "weekday" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL, "endTime" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudyAvailability_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudyAvailability_userId_weekday_key" ON "StudyAvailability"("userId", "weekday");
CREATE INDEX "StudyAvailability_userId_idx" ON "StudyAvailability"("userId");

CREATE TABLE "StudySubjectPreference" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "courseId" TEXT NOT NULL, "difficulty" INTEGER NOT NULL DEFAULT 3,
  CONSTRAINT "StudySubjectPreference_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudySubjectPreference_userId_courseId_key" ON "StudySubjectPreference"("userId", "courseId");
CREATE INDEX "StudySubjectPreference_userId_idx" ON "StudySubjectPreference"("userId");

CREATE TABLE "StudyPlan" (
  "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "planDate" TIMESTAMP(3) NOT NULL, "totalMinutes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudyPlan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "StudyPlan_userId_planDate_key" ON "StudyPlan"("userId", "planDate");
CREATE INDEX "StudyPlan_userId_planDate_idx" ON "StudyPlan"("userId", "planDate");

CREATE TABLE "StudySession" (
  "id" TEXT NOT NULL, "studyPlanId" TEXT NOT NULL, "courseId" TEXT, "classroomAssignmentId" TEXT,
  "title" TEXT NOT NULL, "description" TEXT, "subjectName" TEXT, "externalTaskId" TEXT, "externalUrl" TEXT,
  "priorityReason" TEXT, "priorityScore" INTEGER NOT NULL, "scheduledStart" TIMESTAMP(3) NOT NULL,
  "scheduledEnd" TIMESTAMP(3) NOT NULL, "status" "StudySessionStatus" NOT NULL DEFAULT 'PENDING', "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StudySession_studyPlanId_scheduledStart_idx" ON "StudySession"("studyPlanId", "scheduledStart");
CREATE INDEX "StudySession_classroomAssignmentId_idx" ON "StudySession"("classroomAssignmentId");
CREATE INDEX "StudySession_courseId_idx" ON "StudySession"("courseId");

ALTER TABLE "StudyPreference" ADD CONSTRAINT "StudyPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyAvailability" ADD CONSTRAINT "StudyAvailability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudySubjectPreference" ADD CONSTRAINT "StudySubjectPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudySubjectPreference" ADD CONSTRAINT "StudySubjectPreference_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "ClassroomCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudyPlan" ADD CONSTRAINT "StudyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_studyPlanId_fkey" FOREIGN KEY ("studyPlanId") REFERENCES "StudyPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "ClassroomCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_classroomAssignmentId_fkey" FOREIGN KEY ("classroomAssignmentId") REFERENCES "ClassroomAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
