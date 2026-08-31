export type X1Cell = "X" | "O" | null
export type X1Board = X1Cell[]
const winningLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]] as const

export const emptyBoard = (): X1Board => Array<X1Cell>(9).fill(null)

export function boardWinner(board: X1Board): X1Cell {
  for (const [a, b, c] of winningLines) if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a]
  return null
}

export const boardIsDraw = (board: X1Board) => board.every(Boolean) && !boardWinner(board)

export function markCell(board: X1Board, cell: number, symbol: Exclude<X1Cell, null>) {
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) throw new Error("Casa inválida.")
  if (board[cell]) throw new Error("Essa casa já está ocupada.")
  const next = [...board]
  next[cell] = symbol
  return next
}
