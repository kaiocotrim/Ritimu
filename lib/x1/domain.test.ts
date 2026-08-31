import { describe, expect, it } from "vitest"
import { assertCanRespond, earnedXp, isExpired, outcomeFor, validateChallenge } from "./domain"

describe("regras dos desafios X1", () => {
  it("impede desafio contra si próprio", () => {
    expect(() => validateChallenge("user-1", "user-1", 24)).toThrow("não pode desafiar a si mesmo")
  })

  it("impede usuário não autorizado de aceitar", () => {
    expect(() => assertCanRespond({ status: "PENDING", opponentId: "opponent" }, "intruder")).toThrow("Somente o usuário desafiado")
  })

  it("calcula somente o XP conquistado após o snapshot inicial", () => {
    expect(earnedXp(475, 300)).toBe(175)
    expect(earnedXp(200, 300)).toBe(0)
  })

  it.each([[80, 20, "WIN"], [20, 80, "LOSS"], [50, 50, "DRAW"]] as const)("identifica o resultado %s x %s", (mine, theirs, result) => {
    expect(outcomeFor(mine, theirs)).toBe(result)
  })

  it("impede transição a partir de status não pendente", () => {
    expect(() => assertCanRespond({ status: "ACTIVE", opponentId: "opponent" }, "opponent")).toThrow("não está mais pendente")
  })

  it("identifica corretamente um desafio expirado", () => {
    const now = new Date("2026-08-31T12:00:00.000Z")
    expect(isExpired(new Date("2026-08-31T11:59:59.000Z"), now)).toBe(true)
    expect(isExpired(new Date("2026-08-31T12:00:01.000Z"), now)).toBe(false)
  })
})
