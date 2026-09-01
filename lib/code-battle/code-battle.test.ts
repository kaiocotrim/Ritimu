import { describe, expect, it } from "vitest"
import { calculateBattlePoints, chooseWinner, isAnswerWithinDeadline } from "./rules"
import { prepareQuestions, toPublicQuestion } from "./questions"
import { canJoinThirdPlayer, canStartWithReadyPlayers } from "./validation"

describe("Code Battle rules", () => {
  it("calcula pontuacao com bonus de velocidade", () => {
    expect(calculateBattlePoints({ correct: true, responseTimeMs: 0, timePerQuestionSeconds: 20 })).toBe(150)
    expect(calculateBattlePoints({ correct: true, responseTimeMs: 10_000, timePerQuestionSeconds: 20 })).toBe(125)
    expect(calculateBattlePoints({ correct: false, responseTimeMs: 100, timePerQuestionSeconds: 20 })).toBe(0)
  })

  it("valida prazo da resposta", () => {
    const start = new Date("2026-08-31T12:00:00.000Z")
    expect(isAnswerWithinDeadline(start, 20, new Date("2026-08-31T12:00:19.999Z"))).toBe(true)
    expect(isAnswerWithinDeadline(start, 20, new Date("2026-08-31T12:00:20.001Z"))).toBe(false)
  })

  it("define vencedor e empate", () => {
    expect(chooseWinner({ a: 200, b: 100 })).toBe("a")
    expect(chooseWinner({ a: 100, b: 100 })).toBeNull()
  })

  it("embaralha alternativas sem perder a correta", () => {
    const [question] = prepareQuestions("JAVASCRIPT", "BEGINNER", 1, () => 0)
    expect(question.options[question.correctOption]).toContain("Resposta correta")
  })

  it("nao expoe resposta correta na pergunta publica", () => {
    const [question] = prepareQuestions("TYPESCRIPT", "BEGINNER", 1, () => 0)
    const publicQuestion = toPublicQuestion({ id: "q1", ...question })
    expect(publicQuestion).not.toHaveProperty("correctOption")
  })

  it("impede terceiro jogador e partida sem dois prontos", () => {
    expect(canJoinThirdPlayer(["a", "b"], "c")).toBe(false)
    expect(canStartWithReadyPlayers([{ ready: true }, { ready: false }])).toBe(false)
    expect(canStartWithReadyPlayers([{ ready: true }, { ready: true }])).toBe(true)
  })
})
