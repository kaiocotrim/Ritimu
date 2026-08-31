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
    if (!match || !match.isBotMatch || match.status !== "PLAYING" || match.currentTurnUserId !== BOT_ID || !match.botDifficulty || !match.playerOSubject) return
    const board = asBoard(match.board)
    const cell = chooseBotCell(board, match.allowCapture, match.botDifficulty)
    if (cell === null) return
    let questions = await tx.x1Question.findMany({ where: { active: true, subject: match.playerOSubject, moves: { none: { matchId: match.id } } }, select: { id: true } })
    if (!questions.length) questions = await tx.x1Question.findMany({ where: { active: true, subject: match.playerOSubject }, select: { id: true } })
    if (!questions.length) return
    const question = questions[Math.floor(Math.random() * questions.length)]
    const accuracy = match.botDifficulty === "EASY" ? .55 : match.botDifficulty === "MEDIUM" ? .75 : .92
    const correct = Math.random() < accuracy
    const nextBoard = correct ? markCell(board, cell, "O", match.allowCapture) : board
    const won = correct ? boardWinner(nextBoard) : null
    const draw = !match.allowCapture && correct && boardIsDraw(nextBoard)
    const now = new Date()
    await tx.x1Move.create({ data: { matchId: match.id, playerId: null, isBot: true, cell, questionId: question.id, selectedAnswer: correct ? "[BOT_CORRECT]" : "[BOT_INCORRECT]", correct } })
    await tx.x1Match.update({ where: { id: match.id }, data: { board: nextBoard, currentTurnUserId: won || draw ? null : match.playerXId, turnStartedAt: won || draw ? null : now, status: won || draw ? "FINISHED" : "PLAYING", winnerId: null, finishedAt: won || draw ? now : null } })
  }, { isolationLevel: "Serializable" })
}

export async function listSubjects() {
  const rows = await prisma.x1Question.findMany({ where: { active: true }, distinct: ["subject"], select: { subject: true }, orderBy: { subject: "asc" } })
  return rows.map((row) => row.subject)
}

export async function createRoom(userId: string, settings: { turnTimeSeconds: number | null; allowCapture: boolean; vsBot: boolean; botDifficulty: "EASY" | "MEDIUM" | "HARD" }) {
  if (!validTurnTime(settings.turnTimeSeconds)) throw new X1Error("Tempo por turno inválido.", 400)
  if (!(["EASY", "MEDIUM", "HARD"] as const).includes(settings.botDifficulty)) throw new X1Error("Dificuldade do bot inválida.", 400)
  const subjects = settings.vsBot ? await listSubjects() : []
  const botSubject = subjects.length ? subjects[Math.floor(Math.random() * subjects.length)] : null
  for (let attempt = 0; attempt < 10; attempt++) {
    try { return await prisma.x1Match.create({ data: { code: createRoomCode(), playerXId: userId, board: emptyBoard(), turnTimeSeconds: settings.turnTimeSeconds, allowCapture: settings.allowCapture, isBotMatch: settings.vsBot, botDifficulty: settings.vsBot ? settings.botDifficulty : null, playerOSubject: botSubject, status: settings.vsBot ? "PREPARING" : "WAITING" }, select: { code: true } }) }
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
    const changed = await tx.x1Match.updateMany({ where: { id: match.id, status: "WAITING", playerOId: null }, data: { playerOId: userId, status: "PREPARING" } })
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
    include: { playerX: { select: person }, playerO: { select: person }, winner: { select: person }, currentQuestion: { select: { id: true, subject: true, question: true, options: true } }, moves: { select: { playerId: true, correct: true, isBot: true }, orderBy: { createdAt: "asc" } } },
  })
  if (!match || (match.playerXId !== userId && match.playerOId !== userId)) throw new X1Error("Sala não encontrada.", 404)
  const maySeeQuestion = match.currentTurnUserId === userId && match.currentQuestion && match.currentCell !== null
  const turnEndsAt = match.turnTimeSeconds && match.turnStartedAt ? new Date(match.turnStartedAt.getTime() + match.turnTimeSeconds * 1000).toISOString() : null
  const botPlayer = match.isBotMatch ? { id: BOT_ID, name: "Ritimu Bot", image: null } : null
  const botWon = match.isBotMatch && match.status === "FINISHED" && !match.winner && boardWinner(asBoard(match.board)) === "O"
  return { code: match.code, status: match.status, board: asBoard(match.board), playerX: match.playerX, playerO: match.playerO ?? botPlayer, playerXSubject: match.playerXSubject, playerOSubject: match.playerOSubject, currentTurnUserId: match.currentTurnUserId, turnTimeSeconds: match.turnTimeSeconds, allowCapture: match.allowCapture, isBotMatch: match.isBotMatch, botDifficulty: match.botDifficulty, turnEndsAt, winner: botWon ? botPlayer : match.winner, activeQuestion: maySeeQuestion ? { id: match.currentQuestion!.id, subject: match.currentQuestion!.subject, question: match.currentQuestion!.question, options: match.currentQuestion!.options as string[], cell: match.currentCell! } : null, moves: match.moves, startedAt: match.startedAt?.toISOString() ?? null, finishedAt: match.finishedAt?.toISOString() ?? null }
}

export async function chooseSubject(rawCode: string, userId: string, subject: string) {
  if (!await prisma.x1Question.findFirst({ where: { subject, active: true }, select: { id: true } })) throw new X1Error("Matéria inválida.", 400)
  return prisma.$transaction(async (tx) => {
    const match = await tx.x1Match.findUnique({ where: { code: normalizeRoomCode(rawCode) } })
    if (!match || (match.playerXId !== userId && match.playerOId !== userId)) throw new X1Error("Sala não encontrada.", 404)
    if (match.status !== "PREPARING") throw new X1Error("A escolha de matérias foi encerrada.")
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
    const board = asBoard(match.board); markCell(board, cell, match.playerXId === userId ? "X" : "O", match.allowCapture)
    const subject = match.playerXId === userId ? match.playerXSubject : match.playerOSubject
    let questions = await tx.x1Question.findMany({ where: { active: true, subject: subject!, moves: { none: { matchId: match.id } } }, select: { id: true } })
    if (!questions.length) questions = await tx.x1Question.findMany({ where: { active: true, subject: subject! }, select: { id: true } })
    if (!questions.length) throw new X1Error("Não há perguntas disponíveis para esta matéria.")
    const question = questions[Math.floor(Math.random() * questions.length)]
    const changed = await tx.x1Match.updateMany({ where: { id: match.id, status: "PLAYING", currentTurnUserId: userId, currentQuestionId: null }, data: { currentQuestionId: question.id, currentCell: cell } })
    if (changed.count !== 1) throw new X1Error("O estado da partida mudou. Tente novamente.")
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
    const board = correct ? markCell(asBoard(match.board), match.currentCell, symbol, match.allowCapture) : asBoard(match.board)
    const won = correct ? boardWinner(board) : null
    const draw = !match.allowCapture && correct && boardIsDraw(board)
    const nextUserId = nextTurn(match, userId)
    await tx.x1Move.create({ data: { matchId: match.id, playerId: userId, cell: match.currentCell, questionId: match.currentQuestion.id, selectedAnswer: answer, correct } })
    const now = new Date()
    await tx.x1Match.update({ where: { id: match.id }, data: { board, currentQuestionId: null, currentCell: null, currentTurnUserId: won || draw ? null : nextUserId, turnStartedAt: won || draw ? null : now, status: won || draw ? "FINISHED" : "PLAYING", winnerId: won ? userId : null, finishedAt: won || draw ? now : null } })
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
