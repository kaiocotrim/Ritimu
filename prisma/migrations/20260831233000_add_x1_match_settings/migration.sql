ALTER TABLE "X1Match"
ADD COLUMN "turnTimeSeconds" INTEGER,
ADD COLUMN "allowCapture" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "turnStartedAt" TIMESTAMP(3),
ADD COLUMN "isBotMatch" BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE "X1BotDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
ALTER TABLE "X1Match" ADD COLUMN "botDifficulty" "X1BotDifficulty";
ALTER TABLE "X1Move" ALTER COLUMN "playerId" DROP NOT NULL;
ALTER TABLE "X1Move" ADD COLUMN "isBot" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "X1Match"
ADD CONSTRAINT "X1Match_turn_time_check"
CHECK ("turnTimeSeconds" IS NULL OR "turnTimeSeconds" IN (15, 30, 45, 60));

ALTER TABLE "X1Match" ADD CONSTRAINT "X1Match_bot_settings_check"
CHECK (("isBotMatch" = true AND "botDifficulty" IS NOT NULL AND "playerOId" IS NULL) OR ("isBotMatch" = false AND "botDifficulty" IS NULL));
