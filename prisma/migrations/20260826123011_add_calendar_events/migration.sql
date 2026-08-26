-- CreateEnum
CREATE TYPE "CalendarEventSource" AS ENUM ('RITIMU', 'GOOGLE', 'CLASSROOM');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('STUDY', 'CLASS', 'EXAM', 'ASSIGNMENT', 'PERSONAL', 'OTHER');

-- CreateEnum
CREATE TYPE "CalendarEventStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED');

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "source" "CalendarEventSource" NOT NULL DEFAULT 'RITIMU',
    "type" "CalendarEventType" NOT NULL DEFAULT 'STUDY',
    "status" "CalendarEventStatus" NOT NULL DEFAULT 'PENDING',
    "googleEventId" TEXT,
    "googleCalendarId" TEXT,
    "syncedWithGoogle" BOOLEAN NOT NULL DEFAULT false,
    "googleUpdatedAt" TIMESTAMP(3),
    "classroomAssignmentId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarEvent_userId_startAt_idx" ON "CalendarEvent"("userId", "startAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_classroomAssignmentId_idx" ON "CalendarEvent"("classroomAssignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_userId_googleCalendarId_googleEventId_key" ON "CalendarEvent"("userId", "googleCalendarId", "googleEventId");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_classroomAssignmentId_fkey" FOREIGN KEY ("classroomAssignmentId") REFERENCES "ClassroomAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
