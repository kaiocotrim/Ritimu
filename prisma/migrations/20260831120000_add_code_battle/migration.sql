ALTER TYPE "XpSource" ADD VALUE 'CODE_BATTLE';

CREATE TYPE "CodeBattleRoomStatus" AS ENUM ('WAITING', 'PLAYING', 'FINISHED', 'CANCELED', 'EXPIRED');

CREATE TYPE "CodeBattleStatus" AS ENUM ('WAITING', 'PLAYING', 'FINISHED', 'CANCELED', 'ABANDONED');

CREATE TYPE "CodeBattleTopic" AS ENUM ('LOGIC', 'JAVASCRIPT', 'TYPESCRIPT', 'REACT', 'NODEJS', 'SQL', 'HTML_CSS');

CREATE TYPE "CodeBattleDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

CREATE TABLE "CodeBattleRoom" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "topic" "CodeBattleTopic" NOT NULL,
    "difficulty" "CodeBattleDifficulty" NOT NULL,
    "questionCount" INTEGER NOT NULL DEFAULT 5,
    "timePerQuestion" INTEGER NOT NULL DEFAULT 20,
    "status" "CodeBattleRoomStatus" NOT NULL DEFAULT 'WAITING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CodeBattleRoom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodeBattleParticipant" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ready" BOOLEAN NOT NULL DEFAULT false,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodeBattleParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodeBattle" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "status" "CodeBattleStatus" NOT NULL DEFAULT 'WAITING',
    "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
    "questionStartedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "winnerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CodeBattle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodeBattleQuestion" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "statement" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctOption" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "topic" "CodeBattleTopic" NOT NULL,
    "difficulty" "CodeBattleDifficulty" NOT NULL,
    CONSTRAINT "CodeBattleQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CodeBattleAnswer" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selectedOption" INTEGER,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "responseTimeMs" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CodeBattleAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CodeBattleRoom_code_key" ON "CodeBattleRoom"("code");
CREATE INDEX "CodeBattleRoom_code_idx" ON "CodeBattleRoom"("code");
CREATE INDEX "CodeBattleRoom_hostId_idx" ON "CodeBattleRoom"("hostId");
CREATE INDEX "CodeBattleRoom_status_expiresAt_idx" ON "CodeBattleRoom"("status", "expiresAt");
CREATE UNIQUE INDEX "CodeBattleParticipant_roomId_userId_key" ON "CodeBattleParticipant"("roomId", "userId");
CREATE INDEX "CodeBattleParticipant_roomId_ready_idx" ON "CodeBattleParticipant"("roomId", "ready");
CREATE INDEX "CodeBattleParticipant_userId_idx" ON "CodeBattleParticipant"("userId");
CREATE UNIQUE INDEX "CodeBattle_roomId_key" ON "CodeBattle"("roomId");
CREATE INDEX "CodeBattle_status_idx" ON "CodeBattle"("status");
CREATE INDEX "CodeBattle_winnerId_idx" ON "CodeBattle"("winnerId");
CREATE UNIQUE INDEX "CodeBattleQuestion_battleId_position_key" ON "CodeBattleQuestion"("battleId", "position");
CREATE INDEX "CodeBattleQuestion_battleId_position_idx" ON "CodeBattleQuestion"("battleId", "position");
CREATE UNIQUE INDEX "CodeBattleAnswer_questionId_userId_key" ON "CodeBattleAnswer"("questionId", "userId");
CREATE INDEX "CodeBattleAnswer_battleId_userId_idx" ON "CodeBattleAnswer"("battleId", "userId");
CREATE INDEX "CodeBattleAnswer_questionId_idx" ON "CodeBattleAnswer"("questionId");

ALTER TABLE "CodeBattleRoom" ADD CONSTRAINT "CodeBattleRoom_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeBattleParticipant" ADD CONSTRAINT "CodeBattleParticipant_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CodeBattleRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeBattleParticipant" ADD CONSTRAINT "CodeBattleParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeBattle" ADD CONSTRAINT "CodeBattle_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "CodeBattleRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeBattle" ADD CONSTRAINT "CodeBattle_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CodeBattleQuestion" ADD CONSTRAINT "CodeBattleQuestion_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "CodeBattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeBattleAnswer" ADD CONSTRAINT "CodeBattleAnswer_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "CodeBattle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeBattleAnswer" ADD CONSTRAINT "CodeBattleAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "CodeBattleQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CodeBattleAnswer" ADD CONSTRAINT "CodeBattleAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
