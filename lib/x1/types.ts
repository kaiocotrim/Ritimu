import type { X1Board } from "./game"

export type X1Player = { id: string; name: string; image: string | null }
export type X1PublicMatch = {
  code: string
  status: "WAITING" | "PREPARING" | "PLAYING" | "FINISHED" | "ABANDONED" | "CANCELED"
  board: X1Board
  playerX: X1Player
  playerO: X1Player | null
  playerXSubject: string | null
  playerOSubject: string | null
  currentTurnUserId: string | null
  turnTimeSeconds: number | null
  allowCapture: boolean
  isBotMatch: boolean
  botDifficulty: "EASY" | "MEDIUM" | "HARD" | null
  turnEndsAt: string | null
  winner: X1Player | null
  activeQuestion: { id: string; subject: string; question: string; options: string[]; cell: number } | null
  moves: { playerId: string | null; correct: boolean; isBot: boolean }[]
  startedAt: string | null
  finishedAt: string | null
}
