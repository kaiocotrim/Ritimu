ALTER TABLE "StudyPreference"
ADD COLUMN "plannerTheme" TEXT NOT NULL DEFAULT 'SPACE';

ALTER TABLE "StudyPreference"
ADD CONSTRAINT "StudyPreference_planner_theme_check" CHECK ("plannerTheme" IN ('SPACE', 'LIGHT'));
