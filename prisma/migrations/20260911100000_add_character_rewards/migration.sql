CREATE TABLE "UserCharacter" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "characterId" TEXT NOT NULL,
  "sourceRoadmapId" TEXT,
  "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserCharacter_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RoadmapCharacterReward" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "roadmapId" TEXT NOT NULL,
  "characterId" TEXT NOT NULL,
  "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RoadmapCharacterReward_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "UserCharacter_userId_characterId_key" ON "UserCharacter"("userId", "characterId");
CREATE INDEX "UserCharacter_userId_unlockedAt_idx" ON "UserCharacter"("userId", "unlockedAt");
CREATE UNIQUE INDEX "RoadmapCharacterReward_userId_roadmapId_key" ON "RoadmapCharacterReward"("userId", "roadmapId");
CREATE INDEX "RoadmapCharacterReward_userId_claimedAt_idx" ON "RoadmapCharacterReward"("userId", "claimedAt");
ALTER TABLE "UserCharacter" ADD CONSTRAINT "UserCharacter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapCharacterReward" ADD CONSTRAINT "RoadmapCharacterReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RoadmapCharacterReward" ADD CONSTRAINT "RoadmapCharacterReward_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "StudyRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
