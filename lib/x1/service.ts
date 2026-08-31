import "server-only"

import { prisma } from "@/lib/prisma"
import { boardIsDraw, boardWinner, chooseBotCell, emptyBoard, markCell, type X1Board } from "./game"
import { createRoomCode, normalizeRoomCode } from "./room-code"
import type { X1PublicMatch } from "./types"

export class X1Error extends Error {
  constructor(message: string, public status = 409) { super(message); this.name = "X1Error" }
}

const person = { id: true, name: true, image: true } as const
const asBoard = (value: unknown) => value as X1Board
const turnTimes = [15, 30, 45, 60] as const
const BOT_ID = "RITIMU_BOT"

function validTurnTime(value: number | null): value is 15 | 30 | 45 | 60 | null {
  return value === null || turnTimes.some((time) => time === value)
}

function turnExpired(match: { turnTimeSeconds: number | null; turnStartedAt: Date | null }, now = new Date()) {
  return Boolean(match.turnTimeSeconds && match.turnStartedAt && match.turnStartedAt.getTime() + match.turnTimeSeconds * 1000 <= now.getTime())
}

function nextTurn(match: { playerXId: string; playerOId: string | null; isBotMatch: boolean }, currentUserId: string) {
  return currentUserId === match.playerXId ? (match.isBotMatch ? BOT_ID : match.playerOId) : match.playerXId
}

async function advanceExpiredTurn(code: string, now = new Date()) {
  await prisma.$transaction(async (tx) => {
    const match = await tx.x1Match.findUnique({ where: { code } })
    if (!match || match.status !== "PLAYING" || !turnExpired(match, now)) return
    const nextUserId = nextTurn(match, match.currentTurnUserId ?? match.playerXId)
    await tx.x1Match.updateMany({ where: { id: match.id, status: "PLAYING", currentTurnUserId: match.currentTurnUserId, turnStartedAt: match.turnStartedAt }, data: { currentTurnUserId: nextUserId, currentQuestionId: null, currentCell: null, turnStartedAt: now } })
  }, { isolationLevel: "Serializable" })
}

async function playBotTurn(code: string) {
  await prisma.$transaction(async (tx) => {
    const match = await tx.x1Match.findUnique({ where: { code } })
    if (!match || !match.isBotMatch || match.status !== "PLAYING" || match.currentTurnUserId !== BOT_ID || !match.botDifficulty) return
    const board = asBoard(match.board)
    const botCanCapture = match.allowCapture && match.capturesO < match.captureLimit
    const cell = chooseBotCell(board, botCanCapture, match.botDifficulty)
    if (cell === null) return
    const reserved = await tx.x1MatchQuestion.findFirst({ where: { matchId: match.id, used: false }, orderBy: { order: "asc" }, select: { id: true, questionId: true } })
    if (!reserved) return
    const accuracy = match.botDifficulty === "EASY" ? .55 : match.botDifficulty === "MEDIUM" ? .75 : .92
    const correct = Math.random() < accuracy
    const isCapture = board[cell] === "X"
    const nextBoard = correct ? markCell(board, cell, "O", botCanCapture) : board
    const won = correct ? boardWinner(nextBoard) : null
    const draw = !match.allowCapture && correct && boardIsDraw(nextBoard)
    const now = new Date()
    await tx.x1MatchQuestion.update({ where: { id: reserved.id }, data: { used: true, usedAt: now } })
    await tx.x1Move.create({ data: { matchId: match.id, playerId: null, isBot: true, cell, questionId: reserved.questionId, selectedAnswer: correct ? "[BOT_CORRECT]" : "[BOT_INCORRECT]", correct } })
    await tx.x1Match.update({ where: { id: match.id }, data: { board: nextBoard, ...(correct && isCapture ? { capturesO: { increment: 1 } } : {}), currentTurnUserId: won || draw ? null : match.playerXId, turnStartedAt: won || draw ? null : now, status: won || draw ? "FINISHED" : "PLAYING", winnerId: null, finishedAt: won || draw ? now : null } })
  }, { isolationLevel: "Serializable" })
}

export async function listSubjects() {
  const rows = await prisma.x1Question.findMany({ where: { active: true }, distinct: ["subject"], select: { subject: true }, orderBy: { subject: "asc" } })
  return rows.map((row) => row.subject)
}

export async function createRoom(userId: string, settings: { turnTimeSeconds: number | null; allowCapture: boolean; captureLimit: number; vsBot: boolean; botDifficulty: "EASY" | "MEDIUM" | "HARD"; topicId: string; subtopic: string | null; difficulty: "EASY" | "MEDIUM" | "HARD" }) {
  if (!validTurnTime(settings.turnTimeSeconds)) throw new X1Error("Tempo por turno inválido.", 400)
  if (!(["EASY", "MEDIUM", "HARD"] as const).includes(settings.botDifficulty)) throw new X1Error("Dificuldade do bot inválida.", 400)
  if (!Number.isInteger(settings.captureLimit) || settings.captureLimit < 1 || settings.captureLimit > 5) throw new X1Error("Quantidade de roubos inválida.", 400)
  const topic = await prisma.knowledgeTopic.findFirst({ where: { id: settings.topicId, active: true }, select: { id: true, name: true } })
  if (!topic) throw new X1Error("Escolha um tema válido.", 400)
  for (let attempt = 0; attempt < 10; attempt++) {
    try { return await prisma.x1Match.create({ data: { code: createRoomCode(), playerXId: userId, board: emptyBoard(), turnTimeSeconds: settings.turnTimeSeconds, allowCapture: settings.allowCapture, captureLimit: settings.captureLimit, isBotMatch: settings.vsBot, botDifficulty: settings.vsBot ? settings.botDifficulty : null, topicId: topic.id, subtopic: settings.subtopic, questionDifficulty: settings.difficulty, playerXSubject: topic.name, playerOSubject: null, status: settings.vsBot ? "PREPARING" : "WAITING" }, select: { id: true, code: true } }) }
    catch (error) { if (attempt === 9) throw error }
  }
  throw new X1Error("Não foi possível criar a sala.", 500)
}

export async function joinRoom(rawCode: string, userId: string) {
  const code = normalizeRoomCode(rawCode)
  if (code.length !== 6) throw new X1Error("Código inválido.", 400)
  return prisma.$transaction(async (tx) => {
    const match = await tx.x1Match.findUnique({ where: { code } })
    if (!match) throw new X1Error("Sala não encontrada.", 404)
    if (match.playerXId === userId || match.playerOId === userId) return { code }
    if (match.status !== "WAITING" || match.playerOId) throw new X1Error("A sala já está cheia.")
    const ready = match.preparationStatus === "READY"
    const now = new Date()
    const changed = await tx.x1Match.updateMany({ where: { id: match.id, status: "WAITING", playerOId: null }, data: { playerOId: userId, status: ready ? "PLAYING" : "PREPARING", currentTurnUserId: ready ? match.playerXId : null, startedAt: ready ? now : null, turnStartedAt: ready ? now : null } })
    if (changed.count !== 1) throw new X1Error("Outro jogador entrou primeiro.")
    return { code }
  }, { isolationLevel: "Serializable" })
}

export async function getPublicMatch(rawCode: string, userId: string): Promise<X1PublicMatch> {
  const code = normalizeRoomCode(rawCode)
  await advanceExpiredTurn(code)
  await playBotTurn(code)
  const match = await prisma.x1Match.findUnique({
    where: { code },
    include: { topic: { select: { id: true, name: true } }, playerX: { select: person }, playerO: { select: person }, winner: { select: person }, currentQuestion: { select: { id: true, subject: true, question: true, options: true } }, moves: { select: { playerId: true, correct: true, isBot: true }, orderBy: { createdAt: "asc" } } },
  })
  if (!match || (match.playerXId !== userId && match.playerOId !== userId)) throw new X1Error("Sala não encontrada.", 404)
  const maySeeQuestion = match.currentTurnUserId === userId && match.currentQuestion && match.currentCell !== null
  const turnEndsAt = match.turnTimeSeconds && match.turnStartedAt ? new Date(match.turnStartedAt.getTime() + match.turnTimeSeconds * 1000).toISOString() : null
  const botPlayer = match.isBotMatch ? { id: BOT_ID, name: "Ritimu Bot", image: null } : null
  const botWon = match.isBotMatch && match.status === "FINISHED" && !match.winner && boardWinner(asBoard(match.board)) === "O"
  return { code: match.code, status: match.status, board: asBoard(match.board), playerX: match.playerX, playerO: match.playerO ?? botPlayer, playerXSubject: match.playerXSubject, playerOSubject: match.isBotMatch ? null : match.playerOSubject, currentTurnUserId: match.currentTurnUserId, turnTimeSeconds: match.turnTimeSeconds, allowCapture: match.allowCapture, captureLimit: match.captureLimit, capturesX: match.capturesX, capturesO: match.capturesO, isBotMatch: match.isBotMatch, botDifficulty: match.botDifficulty, topic: match.topic, subtopic: match.subtopic, questionDifficulty: match.questionDifficulty, preparationStatus: match.preparationStatus, preparedCount: match.preparedCount, requiredCount: match.requiredCount, preparationError: match.preparationError, turnEndsAt, winner: botWon ? botPlayer : match.winner, activeQuestion: maySeeQuestion ? { id: match.currentQuestion!.id, subject: match.currentQuestion!.subject, question: match.currentQuestion!.question, options: match.currentQuestion!.options as string[], cell: match.currentCell! } : null, moves: match.moves, startedAt: match.startedAt?.toISOString() ?? null, finishedAt: match.finishedAt?.toISOString() ?? null }
}

export async function chooseSubject(rawCode: string, userId: string, subject: string) {
  if (!await prisma.x1Question.findFirst({ where: { subject, active: true }, select: { id: true } })) throw new X1Error("Matéria inválida.", 400)
  return prisma.$transaction(async (tx) => {
    const match = await tx.x1Match.findUnique({ where: { code: normalizeRoomCode(rawCode) } })
    if (!match || (match.playerXId !== userId && match.playerOId !== userId)) throw new X1Error("Sala não encontrada.", 404)
    if (match.status !== "PREPARING") throw new X1Error("A escolha de matérias foi encerrada.")
    if (match.topicId) throw new X1Error("O tema desta sala já foi configurado.", 400)
    await tx.x1Match.update({ where: { id: match.id }, data: match.playerXId === userId ? { playerXSubject: subject } : { playerOSubject: subject } })
    const ready = await tx.x1Match.findUniqueOrThrow({ where: { id: match.id } })
    if (ready.playerXSubject && ready.playerOSubject) { const now = new Date(); await tx.x1Match.updateMany({ where: { id: match.id, status: "PREPARING" }, data: { status: "PLAYING", currentTurnUserId: ready.playerXId, startedAt: now, turnStartedAt: now } }) }
  }, { isolationLevel: "Serializable" })
}

export async function selectCell(rawCode: string, userId: string, cell: number) {
  const code = normalizeRoomCode(rawCode)
  await advanceExpiredTurn(code)
  return prisma.$transaction(async (tx) => {
    const match = await tx.x1Match.findUnique({ where: { code } })
    if (!match) throw new X1Error("Sala não encontrada.", 404)
    if (match.status !== "PLAYING" || match.currentTurnUserId !== userId) throw new X1Error("Ainda não é o seu turno.", 403)
    if (match.currentQuestionId) throw new X1Error("Responda à pergunta atual primeiro.")
    const board = asBoard(match.board)
    const symbol = match.playerXId === userId ? "X" : "O"
    const capturesUsed = symbol === "X" ? match.capturesX : match.capturesO
    const canCapture = match.allowCapture && capturesUsed < match.captureLimit
    if (board[cell] && board[cell] !== symbol && !canCapture) throw new X1Error(`Você já usou seus ${match.captureLimit} roubos.`, 409)
    markCell(board, cell, symbol, canCapture)
    const reserved = await tx.x1MatchQuestion.findFirst({ where: { matchId: match.id, used: false }, orderBy: { order: "asc" }, select: { id: true, questionId: true } })
    if (!reserved) throw new X1Error("As perguntas preparadas para esta partida acabaram.")
    const changed = await tx.x1Match.updateMany({ where: { id: match.id, status: "PLAYING", currentTurnUserId: userId, currentQuestionId: null }, data: { currentQuestionId: reserved.questionId, currentCell: cell } })
    if (changed.count !== 1) throw new X1Error("O estado da partida mudou. Tente novamente.")
    await tx.x1MatchQuestion.update({ where: { id: reserved.id }, data: { used: true, usedAt: new Date() } })
  }, { isolationLevel: "Serializable" })
}

export async function answerQuestion(rawCode: string, userId: string, answer: string) {
  const code = normalizeRoomCode(rawCode)
  await advanceExpiredTurn(code)
  return prisma.$transaction(async (tx) => {
    const match = await tx.x1Match.findUnique({ where: { code }, include: { currentQuestion: true } })
    if (!match || !match.currentQuestion || match.currentCell === null) throw new X1Error("Não há pergunta ativa.", 400)
    if (match.status !== "PLAYING" || match.currentTurnUserId !== userId) throw new X1Error("Esta pergunta não pertence a você.", 403)
    const correct = answer === match.currentQuestion.correctAnswer
    const symbol = match.playerXId === userId ? "X" : "O"
    const currentBoard = asBoard(match.board)
    const isCapture = Boolean(currentBoard[match.currentCell] && currentBoard[match.currentCell] !== symbol)
    const capturesUsed = symbol === "X" ? match.capturesX : match.capturesO
    const canCapture = match.allowCapture && capturesUsed < match.captureLimit
    const board = correct ? markCell(currentBoard, match.currentCell, symbol, canCapture) : currentBoard
    const won = correct ? boardWinner(board) : null
    const draw = !match.allowCapture && correct && boardIsDraw(board)
    const nextUserId = nextTurn(match, userId)
    await tx.x1Move.create({ data: { matchId: match.id, playerId: userId, cell: match.currentCell, questionId: match.currentQuestion.id, selectedAnswer: answer, correct } })
    const now = new Date()
    await tx.x1Match.update({ where: { id: match.id }, data: { board, ...(correct && isCapture ? symbol === "X" ? { capturesX: { increment: 1 } } : { capturesO: { increment: 1 } } : {}), currentQuestionId: null, currentCell: null, currentTurnUserId: won || draw ? null : nextUserId, turnStartedAt: won || draw ? null : now, status: won || draw ? "FINISHED" : "PLAYING", winnerId: won ? userId : null, finishedAt: won || draw ? now : null } })
    return { correct, correctAnswer: match.currentQuestion.correctAnswer, explanation: match.currentQuestion.explanation, finished: Boolean(won || draw) }
  }, { isolationLevel: "Serializable" })
}

export async function leaveRoom(rawCode: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const match = await tx.x1Match.findUnique({ where: { code: normalizeRoomCode(rawCode) } })
    if (!match || (match.playerXId !== userId && match.playerOId !== userId)) throw new X1Error("Sala não encontrada.", 404)
    if (["FINISHED", "ABANDONED", "CANCELED"].includes(match.status)) return
    const waiting = match.status === "WAITING"
    const winnerId = waiting ? null : match.playerXId === userId ? match.playerOId : match.playerXId
    await tx.x1Match.update({ where: { id: match.id }, data: { status: waiting ? "CANCELED" : "ABANDONED", winnerId, currentTurnUserId: null, currentQuestionId: null, currentCell: null, finishedAt: new Date() } })
  })
}

export function x1ErrorResponse(error: unknown) {
  if (error instanceof X1Error) return Response.json({ error: error.message }, { status: error.status })
  console.error(error); return Response.json({ error: "Não foi possível concluir a ação." }, { status: 500 })
}
