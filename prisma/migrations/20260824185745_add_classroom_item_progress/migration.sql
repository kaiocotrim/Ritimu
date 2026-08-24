-- AlterTable
ALTER TABLE "ClassroomCourse" ADD COLUMN     "totalItems" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ClassroomItemCompletion" (
    "id" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassroomItemCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClassroomItemCompletion_userId_courseId_completed_idx" ON "ClassroomItemCompletion"("userId", "courseId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomItemCompletion_userId_courseId_itemKey_key" ON "ClassroomItemCompletion"("userId", "courseId", "itemKey");

-- AddForeignKey
ALTER TABLE "ClassroomItemCompletion" ADD CONSTRAINT "ClassroomItemCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomItemCompletion" ADD CONSTRAINT "ClassroomItemCompletion_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "ClassroomCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
