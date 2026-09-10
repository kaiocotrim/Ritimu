CREATE TABLE "RoadmapAssessmentAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "correctAnswers" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "certificateEligible" BOOLEAN NOT NULL DEFAULT false,
    "answers" JSONB NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoadmapAssessmentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RoadmapAssessmentAttempt_userId_roadmapId_submittedAt_idx" ON "RoadmapAssessmentAttempt"("userId", "roadmapId", "submittedAt");
CREATE INDEX "RoadmapAssessmentAttempt_roadmapId_passed_idx" ON "RoadmapAssessmentAttempt"("roadmapId", "passed");
ALTER TABLE "RoadmapAssessmentAttempt" ADD CONSTRAINT "RoadmapAssessmentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapAssessmentAttempt" ADD CONSTRAINT "RoadmapAssessmentAttempt_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "StudyRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
