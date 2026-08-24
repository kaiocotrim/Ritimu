/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "users";

-- CreateTable
CREATE TABLE "ClassroomCourse" (
    "id" TEXT NOT NULL,
    "googleCourseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "section" TEXT,
    "classroomUrl" TEXT,
    "calendarId" TEXT,
    "courseState" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassroomCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomAssignment" (
    "id" TEXT NOT NULL,
    "googleAssignmentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "maxPoints" DOUBLE PRECISION,
    "state" TEXT,
    "workType" TEXT,
    "classroomUrl" TEXT,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassroomAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassroomCourse_userId_idx" ON "ClassroomCourse"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomCourse_userId_googleCourseId_key" ON "ClassroomCourse"("userId", "googleCourseId");

-- CreateIndex
CREATE INDEX "ClassroomAssignment_courseId_idx" ON "ClassroomAssignment"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomAssignment_courseId_googleAssignmentId_key" ON "ClassroomAssignment"("courseId", "googleAssignmentId");

-- AddForeignKey
ALTER TABLE "ClassroomCourse" ADD CONSTRAINT "ClassroomCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomAssignment" ADD CONSTRAINT "ClassroomAssignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "ClassroomCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
