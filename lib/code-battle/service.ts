import { Prisma } from "@/lib/generated/prisma/client"
import { XpSource } from "@/lib/generated/prisma/enums"
import { awardXp } from "@/lib/gamification"
import { prisma } from "@/lib/prisma"
import { CodeBattleError } from "./auth"
import { prepareQuestions, toPublicQuestion } from "./questions"
import { calculateBattlePoints, chooseWinner } from "./rules"
import { createCodeBattleRoomCode, normalizeCodeBattleRoomCode } from "./room-code"
import { isCodeBattleDifficulty, isCodeBattleTopic } from "./types"

const MAX_ATTEMPTS = 8
const ROOM_TTL_MS = 30 * 60 * 1000

export async function createCodeBattleRoom(userId: string, input: { topic: unknown; difficulty: unknown; questionCount?: unknown; timePerQuestion?: unknown }) {
  if (!isCodeBattleTopic(input.topic)) throw new CodeBattleError("Escolha um tema valido.")
  if (!isCodeBattleDifficulty(input.difficulty)) throw new CodeBattleError("Escolha uma dificuldade valida.")
  const questionCount = Number(input.questionCount ?? 5)
  const timePerQuestion = Number(input.timePerQuestion ?? 20)
  if (!Number.isInteger(questionCount) || questionCount !== 5) throw new CodeBattleError("Este MVP usa 5 perguntas.")
  if (!Number.isInteger(timePerQuestion) || timePerQuestion < 10 || timePerQuestion > 60) throw new CodeBattleError("Tempo por pergunta invalido.")

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const code = createCodeBattleRoomCode()
    const exists = await prisma.codeBattleRoom.findUnique({ where: { code }, select: { id: true } })
    if (exists) continue
    return prisma.codeBattleRoom.create({
      data: {
        code,
        hostId: userId,
        topic: input.topic,
        difficulty: input.difficulty,
        questionCount,
        timePerQuestion,
        expiresAt: new Date(Date.now() + ROOM_TTL_MS),
        participants: { create: { userId } },
      },
      select: { id: true, code: true },
    })
  }
  throw new CodeBattleError("Nao foi possivel gerar um codigo unico.", 500)
}

export async function joinCodeBattleRoom(codeInput: string, userId: string) {
  const code = normalizeCodeBattleRoomCode(codeInput)
  if (code.length !== 6) throw new CodeBattleError("Codigo da sala invalido.")
  return prisma.$transaction(async (tx) => {
    const room = await tx.codeBattleRoom.findUnique({ where: { code }, include: { participants: true } })
    if (!room) throw new CodeBattleError("Sala nao encontrada.", 404)
    if (room.status === "CANCELED" || room.status === "FINISHED") throw new CodeBattleError("Sala encerrada.", 409)
    if (room.expiresAt.getTime() < Date.now()) {
      await tx.codeBattleRoom.update({ where: { id: room.id }, data: { status: "EXPIRED" } })
      throw new CodeBattleError("Sala expirada.", 410)
    }
    if (room.hostId === userId || room.participants.some((participant) => participant.userId === userId)) return { id: room.id, code: room.code }
    if (room.participants.length >= 2) throw new CodeBattleError("Sala cheia.", 409)
    if (room.status !== "WAITING") throw new CodeBattleError("Esta sala nao aceita entrada.", 409)
    await tx.codeBattleParticipant.create({ data: { roomId: room.id, userId } })
    return { id: room.id, code: room.code }
  })
}

export async function getRoomStateByCode(codeInput: string, userId: string) {
  const code = normalizeCodeBattleRoomCode(codeInput)
  const room = await prisma.codeBattleRoom.findUnique({
    where: { code },
    include: {
      host: { select: { id: true, name: true, email: true, image: true } },
      participants: { orderBy: { joinedAt: "asc" }, include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      battle: { select: { id: true, status: true } },
    },
  })
  if (!room) throw new CodeBattleError("Sala nao encontrada.", 404)
  if (!room.participants.some((participant) => participant.userId === userId)) throw new CodeBattleError("Voce nao pertence a esta sala.", 403)
  return room
}

export async function setReady(roomId: string, userId: string, ready: boolean) {
  const participant = await prisma.codeBattleParticipant.findUnique({ where: { roomId_userId: { roomId, userId } } })
  if (!participant) throw new CodeBattleError("Voce nao pertence a esta sala.", 403)
  return prisma.codeBattleParticipant.update({ where: { id: participant.id }, data: { ready } })
}

export async function leaveRoom(roomId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const room = await tx.codeBattleRoom.findUnique({ where: { id: roomId }, include: { battle: true } })
    if (!room) throw new CodeBattleError("Sala nao encontrada.", 404)
    const participant = await tx.codeBattleParticipant.findUnique({ where: { roomId_userId: { roomId, userId } } })
    if (!participant) throw new CodeBattleError("Voce nao pertence a esta sala.", 403)
    if (room.hostId === userId && room.status === "WAITING") {
      return tx.codeBattleRoom.update({ where: { id: roomId }, data: { status: "CANCELED" }, select: { id: true, code: true } })
    }
    if (room.battle && room.battle.status === "PLAYING") {
      await finishBattle(tx, room.battle.id)
      return { id: room.id, code: room.code }
    }
    await tx.codeBattleParticipant.delete({ where: { id: participant.id } })
    return { id: room.id, code: room.code }
  })
}

export async function startBattle(roomId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const room = await tx.codeBattleRoom.findUnique({ where: { id: roomId }, include: { participants: true, battle: true } })
    if (!room) throw new CodeBattleError("Sala nao encontrada.", 404)
    if (room.hostId !== userId) throw new CodeBattleError("Apenas o criador pode iniciar.", 403)
    if (room.battle) return { id: room.battle.id }
    if (room.status !== "WAITING") throw new CodeBattleError("Sala nao esta aguardando.", 409)
    if (room.participants.length !== 2 || room.participants.some((participant) => !participant.ready)) throw new CodeBattleError("Os dois jogadores precisam estar prontos.", 409)
    const battle = await tx.codeBattle.create({
      data: {
        roomId,
        status: "PLAYING",
        startedAt: new Date(),
        questionStartedAt: new Date(),
        questions: { createMany: { data: prepareQuestions(room.topic, room.difficulty, room.questionCount) } },
      },
      select: { id: true },
    })
    await tx.codeBattleRoom.update({ where: { id: roomId }, data: { status: "PLAYING" } })
    return battle
  })
}

export async function getBattleState(battleId: string, userId: string) {
  const battle = await prisma.codeBattle.findUnique({
    where: { id: battleId },
    include: {
      room: { include: { participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } } } },
      questions: { orderBy: { position: "asc" } },
      answers: true,
    },
  })
  if (!battle) throw new CodeBattleError("Partida nao encontrada.", 404)
  if (!battle.room.participants.some((participant) => participant.userId === userId)) throw new CodeBattleError("Voce nao pertence a esta partida.", 403)
  const current = battle.questions[battle.currentQuestionIndex] ?? null
  const scores = Object.fromEntries(battle.room.participants.map((participant) => [participant.userId, battle.answers.filter((answer) => answer.userId === participant.userId).reduce((sum, answer) => sum + answer.points, 0)]))
  return {
    battle: { id: battle.id, status: battle.status, currentQuestionIndex: battle.currentQuestionIndex, questionStartedAt: battle.questionStartedAt, startedAt: battle.startedAt, finishedAt: battle.finishedAt, winnerId: battle.winnerId },
    room: battle.room,
    question: current && battle.status === "PLAYING" ? toPublicQuestion(current) : null,
    answeredUserIds: current ? battle.answers.filter((answer) => answer.questionId === current.id).map((answer) => answer.userId) : [],
    scores,
    timePerQuestion: battle.room.timePerQuestion,
  }
}

export async function answerQuestion(battleId: string, userId: string, input: { questionId: unknown; selectedOption: unknown }) {
  if (typeof input.questionId !== "string") throw new CodeBattleError("Pergunta invalida.")
  const selectedOption = Number(input.selectedOption)
  if (!Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption > 3) throw new CodeBattleError("Resposta invalida.")
  return prisma.$transaction(async (tx) => {
    const battle = await tx.codeBattle.findUnique({ where: { id: battleId }, include: { room: { include: { participants: true } }, questions: { orderBy: { position: "asc" } } } })
    if (!battle) throw new CodeBattleError("Partida nao encontrada.", 404)
    if (battle.status !== "PLAYING" || !battle.questionStartedAt) throw new CodeBattleError("Partida nao esta ativa.", 409)
    if (!battle.room.participants.some((participant) => participant.userId === userId)) throw new CodeBattleError("Voce nao pertence a esta partida.", 403)
    const question = battle.questions[battle.currentQuestionIndex]
    if (!question || question.id !== input.questionId) throw new CodeBattleError("Esta nao e a pergunta atual.", 409)
    const now = new Date()
    const responseTimeMs = Math.max(0, now.getTime() - battle.questionStartedAt.getTime())
    const expired = responseTimeMs > battle.room.timePerQuestion * 1000
    const isCorrect = !expired && question.correctOption === selectedOption
    const points = calculateBattlePoints({ correct: isCorrect, responseTimeMs, timePerQuestionSeconds: battle.room.timePerQuestion })
    try {
      await tx.codeBattleAnswer.create({ data: { battleId, questionId: question.id, userId, selectedOption, isCorrect, responseTimeMs, points, answeredAt: now } })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new CodeBattleError("Voce ja respondeu esta pergunta.", 409)
      throw error
    }
    await maybeAdvanceOrFinish(tx, battleId)
    return { correct: isCorrect, expired, points }
  })
}

export async function advanceBattle(battleId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const battle = await tx.codeBattle.findUnique({ where: { id: battleId }, include: { room: { include: { participants: true } } } })
    if (!battle) throw new CodeBattleError("Partida nao encontrada.", 404)
    if (!battle.room.participants.some((participant) => participant.userId === userId)) throw new CodeBattleError("Voce nao pertence a esta partida.", 403)
    await maybeAdvanceOrFinish(tx, battleId, true)
    return { id: battleId }
  })
}

async function maybeAdvanceOrFinish(tx: Prisma.TransactionClient, battleId: string, force = false) {
  const battle = await tx.codeBattle.findUnique({ where: { id: battleId }, include: { room: { include: { participants: true } }, questions: { orderBy: { position: "asc" } }, answers: true } })
  if (!battle || battle.status !== "PLAYING" || !battle.questionStartedAt) return
  const question = battle.questions[battle.currentQuestionIndex]
  if (!question) return finishBattle(tx, battleId)
  const answered = battle.answers.filter((answer) => answer.questionId === question.id).length
  const timedOut = Date.now() > battle.questionStartedAt.getTime() + battle.room.timePerQuestion * 1000
  if (!force && answered < 2 && !timedOut) return
  if (battle.currentQuestionIndex + 1 >= battle.questions.length) return finishBattle(tx, battleId)
  await tx.codeBattle.update({ where: { id: battleId }, data: { currentQuestionIndex: { increment: 1 }, questionStartedAt: new Date() } })
}

async function finishBattle(tx: Prisma.TransactionClient, battleId: string) {
  const battle = await tx.codeBattle.findUnique({ where: { id: battleId }, include: { room: { include: { participants: true } }, answers: true } })
  if (!battle || battle.status === "FINISHED") return
  const scores = Object.fromEntries(battle.room.participants.map((participant) => [participant.userId, battle.answers.filter((answer) => answer.userId === participant.userId).reduce((sum, answer) => sum + answer.points, 0)]))
  const winnerId = chooseWinner(scores)
  await tx.codeBattle.update({ where: { id: battleId }, data: { status: "FINISHED", winnerId, finishedAt: new Date(), questionStartedAt: null } })
  await tx.codeBattleRoom.update({ where: { id: battle.roomId }, data: { status: "FINISHED" } })
  for (const participant of battle.room.participants) {
    await awardXp(tx, { userId: participant.userId, amount: participant.userId === winnerId ? 50 : 25, source: XpSource.CODE_BATTLE, referenceId: `${battleId}:${participant.userId}`, description: "Code Battle finalizada" })
  }
}

export async function getBattleResult(battleId: string, userId: string) {
  const state = await getBattleState(battleId, userId)
  if (state.battle.status !== "FINISHED") throw new CodeBattleError("Resultado ainda nao disponivel.", 409)
  const questions = await prisma.codeBattleQuestion.findMany({ where: { battleId }, orderBy: { position: "asc" }, include: { answers: true } })
  return { ...state, questions }
}

export async function getUserBattleHistory(userId: string) {
  return prisma.codeBattle.findMany({
    where: { room: { participants: { some: { userId } } } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { room: { include: { participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } } } }, answers: true },
  })
}
