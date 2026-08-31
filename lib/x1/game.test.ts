import { describe, expect, it } from "vitest"
import { boardIsDraw, boardWinner, emptyBoard, markCell } from "./game"
import { createRoomCode, normalizeRoomCode } from "./room-code"

describe("X1 de conhecimento", () => {
  it.each([["X","X","X",null,null,null,null,null,null], ["O",null,null,"O",null,null,"O",null,null], ["X",null,null,null,"X",null,null,null,"X"]] as const)("detecta uma linha vencedora", (...board) => expect(boardWinner([...board])).toBeTruthy())
  it("detecta empate", () => expect(boardIsDraw(["X","O","X","X","O","O","O","X","X"])).toBe(true))
  it("só marca casas livres", () => expect(() => markCell(["X", ...emptyBoard().slice(1)], 0, "O")).toThrow("ocupada"))
  it("valida os limites do tabuleiro", () => expect(() => markCell(emptyBoard(), 9, "X")).toThrow("inválida"))
  it("normaliza e gera código de sala", () => { expect(normalizeRoomCode(" ab-12cd ")).toBe("AB12CD"); expect(createRoomCode(() => 0)).toBe("AAAAAA") })
})
