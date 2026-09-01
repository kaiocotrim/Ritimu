ALTER TABLE "X1Match"
ADD COLUMN "totalRounds" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "currentRound" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "roundWinsX" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "roundWinsO" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "X1Move"
ADD COLUMN "round" INTEGER NOT NULL DEFAULT 1;

ALTER TABLE "X1Match"
ADD CONSTRAINT "X1Match_total_rounds_check" CHECK ("totalRounds" IN (1, 3, 5)),
ADD CONSTRAINT "X1Match_current_round_check" CHECK ("currentRound" >= 1 AND "currentRound" <= "totalRounds");
