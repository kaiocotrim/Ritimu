export type X1Cell = "X" | "O" | null
export type X1Board = X1Cell[]
const winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]] as const

export const emptyBoard = (): X1Board => Array<X1Cell>(9).fill(null)

export function boardWinner(board: X1Board): X1Cell {
  for (const [a, b, c] of winningLines) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  return null
}

export const boardIsDraw = (board: X1Board) => board.every(Boolean) && !boardWinner(board)

export function canSelectCell(board: X1Board, cell: number, symbol: Exclude<X1Cell, null>, allowCapture = false) {
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) return false
  return board[cell] === null || (allowCapture && board[cell] !== symbol)
}

export function markCell(board: X1Board, cell: number, symbol: Exclude<X1Cell, null>, allowCapture = false) {
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) throw new Error("Casa inválida.")
  if (!canSelectCell(board, cell, symbol, allowCapture)) throw new Error(board[cell] === symbol ? "Essa casa já é sua." : "Essa casa já está ocupada.")
  const next = [...board]
  next[cell] = symbol
  return next
}

export function chooseBotCell(board: X1Board, allowCapture: boolean, difficulty: "EASY" | "MEDIUM" | "HARD", random = Math.random) {
  const candidates = board.map((_, cell) => cell).filter((cell) => canSelectCell(board, cell, "O", allowCapture))
  if (!candidates.length) return null
  const winning = candidates.find((cell) => boardWinner(markCell(board, cell, "O", allowCapture)) === "O")
  if (difficulty !== "EASY" && winning !== undefined) return winning
  if (difficulty === "HARD") {
    const threats = board.map((_, cell) => cell).filter((cell) => canSelectCell(board, cell, "X", false))
    const block = threats.find((cell) => boardWinner(markCell(board, cell, "X")) === "X")
    if (block !== undefined && canSelectCell(board, block, "O", allowCapture)) return block
    if (candidates.includes(4)) return 4
  }
  return candidates[Math.floor(random() * candidates.length)]
}
