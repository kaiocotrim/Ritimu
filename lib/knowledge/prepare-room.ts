import "server-only"

import { prisma } from "@/lib/prisma"
import { generateQuestions, QuestionGenerationUnavailable } from "./generate-questions"
import { missingQuestionCount, selectGameQuestionIds } from "./select-game-questions"
import { questionFingerprint } from "./validate-generated-questions"

export async function prepareRoomQuestions(matchId: string) {
  const stale = new Date(Date.now() - 60_000)
  const lock = await prisma.x1Match.updateMany({ where: { id: matchId, preparationStatus: { not: "READY" }, OR: [{ preparationLockedAt: null }, { preparationLockedAt: { lt: stale } }] }, data: { preparationLockedAt: new Date(), preparationStatus: "SEARCHING_DATABASE", preparationError: null } })
  if (!lock.count) return
  try {
    const match = await prisma.x1Match.findUnique({ where: { id: matchId }, include: { topic: true } })
    if (!match?.topic) throw new Error("Tema da sala não encontrado.")
    const where = { topicId: match.topicId!, difficulty: match.questionDifficulty, active: true, reviewStatus: "APPROVED" as const, ...(match.subtopic ? { subtopic: match.subtopic } : {}) }
    let existing = await prisma.x1Question.findMany({ where, select: { id: true, question: true, options: true } })
    let generationAttempts = 0
    while (missingQuestionCount(existing.length, match.requiredCount) > 0 && generationAttempts < 6) {
      const missing = missingQuestionCount(existing.length, match.requiredCount)
      await prisma.x1Match.update({ where: { id: match.id }, data: { preparationStatus: "GENERATING_QUESTIONS", preparedCount: existing.length } })
      const generated = await generateQuestions({ topic: match.topic.name, subtopic: match.subtopic, difficulty: match.questionDifficulty, count: Math.min(missing, 12) })
      const known = new Set(existing.map((item) => questionFingerprint(item.question, item.options as string[])))
      const fresh = generated.filter((item) => !known.has(questionFingerprint(item.statement, item.alternatives)))
      await prisma.x1Question.createMany({ data: fresh.map((item) => ({ subject: match.topic!.name, topicId: match.topicId, subtopic: match.subtopic, difficulty: match.questionDifficulty, question: item.statement, options: item.alternatives, correctAnswer: item.alternatives[item.correctAnswerIndex], explanation: item.explanation, source: "AI", reviewStatus: "APPROVED", fingerprint: questionFingerprint(item.statement, item.alternatives) })), skipDuplicates: true })
      existing = await prisma.x1Question.findMany({ where, select: { id: true, question: true, options: true } })
      generationAttempts++
    }
    if (existing.length < match.requiredCount) throw new QuestionGenerationUnavailable(`Há apenas ${existing.length} perguntas disponíveis para este tema e dificuldade.`)
    const selected = selectGameQuestionIds(existing.map((item) => item.id), match.requiredCount)
    await prisma.$transaction(async (tx) => {
      await tx.x1MatchQuestion.deleteMany({ where: { matchId: match.id, used: false } })
      await tx.x1MatchQuestion.createMany({ data: selected.map((questionId, order) => ({ matchId: match.id, questionId, order })), skipDuplicates: true })
      const canStart = match.isBotMatch || Boolean(match.playerOId)
      const now = new Date()
      await tx.x1Match.update({ where: { id: match.id }, data: { preparationStatus: "READY", preparedCount: selected.length, preparationLockedAt: null, preparationError: null, ...(canStart ? { status: "PLAYING", currentTurnUserId: match.playerXId, startedAt: match.startedAt ?? now, turnStartedAt: now } : {}) } })
    })
  } catch (error) {
    const message = error instanceof QuestionGenerationUnavailable ? `${error.message} Escolha outro tema ou dificuldade.` : error instanceof Error ? error.message : "Não foi possível preparar as perguntas."
    await prisma.x1Match.update({ where: { id: matchId }, data: { preparationStatus: "FAILED", preparationError: message, preparationLockedAt: null } })
    console.error("X1 question preparation failed", { matchId, reason: error instanceof QuestionGenerationUnavailable ? "unavailable" : "provider_or_validation" })
  }
}
