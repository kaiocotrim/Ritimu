CREATE TYPE "DuelStatus" AS ENUM ('PENDING', 'ACTIVE', 'DECLINED', 'CANCELED', 'COMPLETED');

CREATE TABLE "Duel" (
  "id" TEXT NOT NULL,
  "challengerId" TEXT NOT NULL,
  "opponentId" TEXT NOT NULL,
  "status" "DuelStatus" NOT NULL DEFAULT 'PENDING',
  "durationHours" INTEGER NOT NULL,
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "challengerInitialXp" INTEGER,
  "opponentInitialXp" INTEGER,
  "challengerFinalXp" INTEGER,
  "opponentFinalXp" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Duel_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Duel_players_check" CHECK ("challengerId" <> "opponentId"),
  CONSTRAINT "Duel_duration_check" CHECK ("durationHours" IN (24, 72, 168))
);

CREATE INDEX "Duel_challengerId_status_createdAt_idx" ON "Duel"("challengerId", "status", "createdAt");
CREATE INDEX "Duel_opponentId_status_createdAt_idx" ON "Duel"("opponentId", "status", "createdAt");
CREATE INDEX "Duel_status_endsAt_idx" ON "Duel"("status", "endsAt");
CREATE UNIQUE INDEX "Duel_one_pending_pair_idx" ON "Duel" (LEAST("challengerId", "opponentId"), GREATEST("challengerId", "opponentId")) WHERE "status" = 'PENDING';

ALTER TABLE "Duel" ADD CONSTRAINT "Duel_challengerId_fkey" FOREIGN KEY ("challengerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Duel" ADD CONSTRAINT "Duel_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove the superseded knowledge-game implementation after the productivity duel is ready.
DROP TABLE IF EXISTS "X1Move";
DROP TABLE IF EXISTS "X1MatchQuestion";
DROP TABLE IF EXISTS "X1Match";
DROP TABLE IF EXISTS "X1Question";
DROP TYPE IF EXISTS "X1MatchStatus";
