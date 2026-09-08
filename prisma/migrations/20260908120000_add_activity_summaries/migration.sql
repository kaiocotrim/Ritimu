-- CreateTable
CREATE TABLE "ActivitySummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "itemKey" TEXT NOT NULL,
    "summaryUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySummary_userId_courseId_itemKey_key" ON "ActivitySummary"("userId", "courseId", "itemKey");

-- AddForeignKey
ALTER TABLE "ActivitySummary" ADD CONSTRAINT "ActivitySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySummary" ADD CONSTRAINT "ActivitySummary_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "ClassroomCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
