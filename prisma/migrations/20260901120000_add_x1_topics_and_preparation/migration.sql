CREATE TYPE "X1QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "X1QuestionSource" AS ENUM ('MANUAL', 'AI');
CREATE TYPE "X1QuestionReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "X1PreparationStatus" AS ENUM ('SEARCHING_DATABASE', 'GENERATING_QUESTIONS', 'READY', 'FAILED');

CREATE TABLE "KnowledgeTopic" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "normalizedName" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "icon" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "KnowledgeTopic_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KnowledgeTopic_normalizedName_key" ON "KnowledgeTopic"("normalizedName");
CREATE UNIQUE INDEX "KnowledgeTopic_slug_key" ON "KnowledgeTopic"("slug");
CREATE INDEX "KnowledgeTopic_normalizedName_idx" ON "KnowledgeTopic"("normalizedName");

INSERT INTO "KnowledgeTopic" ("id", "name", "normalizedName", "slug") VALUES
('topic-matematica', 'Matemática', 'matematica', 'matematica'),
('topic-portugues', 'Português', 'portugues', 'portugues'),
('topic-ciencias', 'Ciências', 'ciencias', 'ciencias'),
('topic-gerais', 'Conhecimentos gerais', 'conhecimentos gerais', 'conhecimentos-gerais'),
('topic-futebol', 'Futebol', 'futebol', 'futebol'),
('topic-programacao', 'Programação', 'programacao', 'programacao'),
('topic-historia', 'História', 'historia', 'historia'),
('topic-geografia', 'Geografia', 'geografia', 'geografia'),
('topic-jiujitsu', 'Jiu-jítsu', 'jiu jitsu', 'jiu-jitsu');

ALTER TABLE "X1Question"
  ADD COLUMN "difficulty" "X1QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN "subtopic" TEXT,
  ADD COLUMN "source" "X1QuestionSource" NOT NULL DEFAULT 'MANUAL',
  ADD COLUMN "reviewStatus" "X1QuestionReviewStatus" NOT NULL DEFAULT 'APPROVED',
  ADD COLUMN "fingerprint" TEXT,
  ADD COLUMN "topicId" TEXT;

UPDATE "X1Question" SET
  "topicId" = CASE "subject"
    WHEN 'Matemática' THEN 'topic-matematica'
    WHEN 'Português' THEN 'topic-portugues'
    WHEN 'Ciências' THEN 'topic-ciencias'
    WHEN 'Conhecimentos Gerais' THEN 'topic-gerais'
    ELSE NULL
  END,
  "fingerprint" = md5(lower(trim("question")) || '|' || "options"::text);

CREATE UNIQUE INDEX "X1Question_fingerprint_key" ON "X1Question"("fingerprint");
CREATE INDEX "X1Question_topicId_difficulty_active_idx" ON "X1Question"("topicId", "difficulty", "active");
ALTER TABLE "X1Question" ADD CONSTRAINT "X1Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "KnowledgeTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "X1Match"
  ADD COLUMN "topicId" TEXT,
  ADD COLUMN "subtopic" TEXT,
  ADD COLUMN "questionDifficulty" "X1QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
  ADD COLUMN "preparationStatus" "X1PreparationStatus" NOT NULL DEFAULT 'SEARCHING_DATABASE',
  ADD COLUMN "preparedCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "requiredCount" INTEGER NOT NULL DEFAULT 12,
  ADD COLUMN "preparationError" TEXT,
  ADD COLUMN "preparationLockedAt" TIMESTAMP(3);

ALTER TABLE "X1Match" ADD CONSTRAINT "X1Match_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "KnowledgeTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "X1MatchQuestion" (
  "id" TEXT NOT NULL,
  "matchId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  "used" BOOLEAN NOT NULL DEFAULT false,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "X1MatchQuestion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "X1MatchQuestion_matchId_order_key" ON "X1MatchQuestion"("matchId", "order");
CREATE UNIQUE INDEX "X1MatchQuestion_matchId_questionId_key" ON "X1MatchQuestion"("matchId", "questionId");
CREATE INDEX "X1MatchQuestion_matchId_used_order_idx" ON "X1MatchQuestion"("matchId", "used", "order");
ALTER TABLE "X1MatchQuestion" ADD CONSTRAINT "X1MatchQuestion_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "X1Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "X1MatchQuestion" ADD CONSTRAINT "X1MatchQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "X1Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
