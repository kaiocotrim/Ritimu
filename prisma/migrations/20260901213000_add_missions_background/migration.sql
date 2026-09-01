ALTER TABLE "StudyPreference"
ADD COLUMN "missionsBackgroundMode" TEXT NOT NULL DEFAULT 'DEFAULT',
ADD COLUMN "missionsBackgroundUrl" TEXT;

ALTER TABLE "StudyPreference"
ADD CONSTRAINT "StudyPreference_missions_background_mode_check"
CHECK ("missionsBackgroundMode" IN ('DEFAULT', 'IMAGE'));
