-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "assessmentAttemptId" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "roadmapName" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 50,
    "totalQuestions" INTEGER NOT NULL DEFAULT 50,
    "percentage" INTEGER NOT NULL DEFAULT 100,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_code_key" ON "Certificate"("code");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_roadmapId_idx" ON "Certificate"("roadmapId");

-- CreateIndex
CREATE INDEX "Certificate_code_idx" ON "Certificate"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_userId_roadmapId_key" ON "Certificate"("userId", "roadmapId");

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "StudyRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_assessmentAttemptId_fkey" FOREIGN KEY ("assessmentAttemptId") REFERENCES "RoadmapAssessmentAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
