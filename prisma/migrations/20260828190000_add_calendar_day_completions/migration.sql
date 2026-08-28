CREATE TABLE "CalendarEventDayCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calendarEventId" TEXT NOT NULL,
    "occurrenceDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalendarEventDayCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CalendarEventDayCompletion_calendarEventId_occurrenceDate_key"
ON "CalendarEventDayCompletion"("calendarEventId", "occurrenceDate");
CREATE INDEX "CalendarEventDayCompletion_userId_occurrenceDate_idx"
ON "CalendarEventDayCompletion"("userId", "occurrenceDate");

ALTER TABLE "CalendarEventDayCompletion" ADD CONSTRAINT "CalendarEventDayCompletion_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CalendarEventDayCompletion" ADD CONSTRAINT "CalendarEventDayCompletion_calendarEventId_fkey"
FOREIGN KEY ("calendarEventId") REFERENCES "CalendarEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "CalendarEventDayCompletion" ("id", "userId", "calendarEventId", "occurrenceDate", "completedAt")
SELECT 'day_completion_' || "id", "userId", "id", date_trunc('day', "startAt"), "updatedAt"
FROM "CalendarEvent"
WHERE "status" = 'COMPLETED'
ON CONFLICT DO NOTHING;
