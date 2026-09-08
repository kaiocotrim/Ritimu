ALTER TYPE "XpSource" ADD VALUE 'ROADMAP_LESSON';

CREATE TYPE "RoadmapDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "RoadmapLessonType" AS ENUM ('STUDY', 'QUIZ', 'CHALLENGE', 'PROJECT', 'REVIEW');
CREATE TYPE "RoadmapProgressStatus" AS ENUM ('AVAILABLE', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "RoadmapOrigin" AS ENUM ('OFFICIAL', 'AI', 'CLASSROOM', 'ADAPTIVE');

CREATE TABLE "StudyRoadmap" (
  "id" TEXT NOT NULL,
  "creatorId" TEXT,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "difficulty" "RoadmapDifficulty" NOT NULL DEFAULT 'BEGINNER',
  "estimatedHours" INTEGER NOT NULL,
  "origin" "RoadmapOrigin" NOT NULL DEFAULT 'OFFICIAL',
  "isOfficial" BOOLEAN NOT NULL DEFAULT false,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "sourceMetadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StudyRoadmap_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoadmapModule" (
  "id" TEXT NOT NULL,
  "roadmapId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "xpReward" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoadmapModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoadmapLesson" (
  "id" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "objective" TEXT,
  "content" JSONB,
  "type" "RoadmapLessonType" NOT NULL DEFAULT 'STUDY',
  "order" INTEGER NOT NULL,
  "estimatedMinutes" INTEGER NOT NULL DEFAULT 30,
  "xpReward" INTEGER NOT NULL DEFAULT 25,
  "sourceMetadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoadmapLesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoadmapLessonDependency" (
  "lessonId" TEXT NOT NULL,
  "prerequisiteId" TEXT NOT NULL,
  CONSTRAINT "RoadmapLessonDependency_pkey" PRIMARY KEY ("lessonId", "prerequisiteId")
);

CREATE TABLE "RoadmapEnrollment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roadmapId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoadmapEnrollment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RoadmapLessonProgress" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "status" "RoadmapProgressStatus" NOT NULL DEFAULT 'AVAILABLE',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RoadmapLessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudyRoadmap_slug_key" ON "StudyRoadmap"("slug");
CREATE INDEX "StudyRoadmap_isPublic_category_idx" ON "StudyRoadmap"("isPublic", "category");
CREATE INDEX "StudyRoadmap_creatorId_idx" ON "StudyRoadmap"("creatorId");
CREATE UNIQUE INDEX "RoadmapModule_roadmapId_order_key" ON "RoadmapModule"("roadmapId", "order");
CREATE INDEX "RoadmapModule_roadmapId_idx" ON "RoadmapModule"("roadmapId");
CREATE UNIQUE INDEX "RoadmapLesson_moduleId_order_key" ON "RoadmapLesson"("moduleId", "order");
CREATE INDEX "RoadmapLesson_moduleId_idx" ON "RoadmapLesson"("moduleId");
CREATE INDEX "RoadmapLessonDependency_prerequisiteId_idx" ON "RoadmapLessonDependency"("prerequisiteId");
CREATE UNIQUE INDEX "RoadmapEnrollment_userId_roadmapId_key" ON "RoadmapEnrollment"("userId", "roadmapId");
CREATE INDEX "RoadmapEnrollment_userId_updatedAt_idx" ON "RoadmapEnrollment"("userId", "updatedAt");
CREATE UNIQUE INDEX "RoadmapLessonProgress_userId_lessonId_key" ON "RoadmapLessonProgress"("userId", "lessonId");
CREATE INDEX "RoadmapLessonProgress_userId_status_idx" ON "RoadmapLessonProgress"("userId", "status");
CREATE INDEX "RoadmapLessonProgress_lessonId_idx" ON "RoadmapLessonProgress"("lessonId");

ALTER TABLE "StudyRoadmap" ADD CONSTRAINT "StudyRoadmap_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RoadmapModule" ADD CONSTRAINT "RoadmapModule_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "StudyRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapLesson" ADD CONSTRAINT "RoadmapLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "RoadmapModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapLessonDependency" ADD CONSTRAINT "RoadmapLessonDependency_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "RoadmapLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapLessonDependency" ADD CONSTRAINT "RoadmapLessonDependency_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "RoadmapLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapEnrollment" ADD CONSTRAINT "RoadmapEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapEnrollment" ADD CONSTRAINT "RoadmapEnrollment_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "StudyRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapLessonProgress" ADD CONSTRAINT "RoadmapLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapLessonProgress" ADD CONSTRAINT "RoadmapLessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "RoadmapLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
