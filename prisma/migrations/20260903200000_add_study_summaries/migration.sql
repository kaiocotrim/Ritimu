-- CreateTable
CREATE TABLE "StudySummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudySummary_userId_courseId_sourceId_key" ON "StudySummary"("userId", "courseId", "sourceId");
CREATE INDEX "StudySummary_userId_courseId_idx" ON "StudySummary"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "StudySummary" ADD CONSTRAINT "StudySummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE;
ALTER TABLE "StudySummary" ADD CONSTRAINT "StudySummary_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "ClassroomCourse"("id") ON DELETE CASCADE;