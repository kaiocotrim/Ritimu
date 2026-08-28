CREATE TYPE "XpSource" AS ENUM ('CLASSROOM_ITEM', 'STUDY_SESSION', 'STUDY_CONTENT');

CREATE TABLE "XpTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" "XpSource" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "XpTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "XpTransaction_userId_source_referenceId_key" ON "XpTransaction"("userId", "source", "referenceId");
CREATE INDEX "XpTransaction_userId_earnedAt_idx" ON "XpTransaction"("userId", "earnedAt");
CREATE INDEX "XpTransaction_source_referenceId_idx" ON "XpTransaction"("source", "referenceId");

ALTER TABLE "XpTransaction" ADD CONSTRAINT "XpTransaction_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "XpTransaction" ("id", "userId", "amount", "source", "referenceId", "description", "earnedAt")
SELECT 'xp_classroom_' || "id", "userId", 25, 'CLASSROOM_ITEM'::"XpSource", "id", 'Atividade do Classroom concluída', "updatedAt"
FROM "ClassroomItemCompletion"
WHERE "completed" = true
ON CONFLICT DO NOTHING;

INSERT INTO "XpTransaction" ("id", "userId", "amount", "source", "referenceId", "description", "earnedAt")
SELECT 'xp_session_' || session."id", plan."userId", 25, 'STUDY_SESSION'::"XpSource", session."id", 'Sessão de estudo concluída', COALESCE(session."completedAt", session."updatedAt")
FROM "StudySession" session
INNER JOIN "StudyPlan" plan ON plan."id" = session."studyPlanId"
WHERE session."status" = 'COMPLETED'
ON CONFLICT DO NOTHING;

INSERT INTO "XpTransaction" ("id", "userId", "amount", "source", "referenceId", "description", "earnedAt")
SELECT 'xp_content_' || "id", "userId", 25, 'STUDY_CONTENT'::"XpSource", "id", 'Conteúdo estudado', "updatedAt"
FROM "StudyContent"
WHERE "studied" = true
ON CONFLICT DO NOTHING;
