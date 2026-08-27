-- AlterTable
ALTER TABLE "StudyPreference"
ADD COLUMN "plannerView" "StudyPlanPeriodType";

ALTER TABLE "CalendarEvent"
ADD COLUMN "routineType" TEXT NOT NULL DEFAULT 'OTHER',
ADD COLUMN "recurrence" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN "recurrenceDays" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN "recurrenceUntil" TIMESTAMP(3);

CREATE INDEX "CalendarEvent_userId_recurrence_idx" ON "CalendarEvent"("userId", "recurrence");
