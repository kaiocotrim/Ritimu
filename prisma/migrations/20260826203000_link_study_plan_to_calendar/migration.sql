-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN "studySessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_studySessionId_key" ON "CalendarEvent"("studySessionId");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
