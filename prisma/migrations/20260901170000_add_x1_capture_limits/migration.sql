ALTER TABLE "X1Match"
ADD COLUMN "captureLimit" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN "capturesX" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "capturesO" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "X1Match"
ADD CONSTRAINT "X1Match_capture_limit_check"
CHECK (
  "captureLimit" BETWEEN 1 AND 5
  AND "capturesX" BETWEEN 0 AND "captureLimit"
  AND "capturesO" BETWEEN 0 AND "captureLimit"
);
