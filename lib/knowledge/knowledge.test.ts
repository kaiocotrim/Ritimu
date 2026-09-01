import { describe, expect, it } from "vitest"
import { comparisonValue, normalizeTopic, suggestedSubtopics } from "./normalize-topic"
import { missingQuestionCount, selectGameQuestionIds } from "./select-game-questions"
import { questionFingerprint, validateGeneratedQuestions } from "./validate-generated-questions"
import { hasQuestionGenerationConfig } from "./generation-config"

const valid = { statement: "Qual é a capital do Brasil?", alternatives: ["Brasília", "Recife", "Manaus", "Curitiba"], correctAnswerIndex: 0, explanation: "Brasília é a capital federal." }

describe("temas de conhecimento", () => {
  it("normaliza espaços, caixa e acentos apenas para comparação", () => expect(normalizeTopic("  História   do Brasil ")).toMatchObject({ name: "História do Brasil", normalizedName: "historia do brasil", slug: "historia-do-brasil" }))
  it("encontra equivalência ignorando acentos e maiúsculas", () => expect(comparisonValue("CIÊNCIAS")).toBe(comparisonValue("ciencias")))
  it("rejeita tema vazio ou curto", () => expect(() => normalizeTopic("  ")).toThrow(/3 caracteres/))
  it("rejeita tema acima do limite", () => expect(() => normalizeTopic("a".repeat(81))).toThrow(/80/))
  it("sugere correção sem alterar silenciosamente", () => expect(normalizeTopic("treino de jiu").suggestion).toBe("Treinamento de jiu-jítsu"))
  it("sugere subtópicos de jiu-jítsu", () => expect(suggestedSubtopics("Treinamento de jiu-jítsu")).toContain("Faixas"))
})

describe("perguntas preparadas", () => {
  it("gera fingerprint estável", () => expect(questionFingerprint(valid.statement, valid.alternatives)).toBe(questionFingerprint(` ${valid.statement} `, [...valid.alternatives].reverse())))
  it("exige exatamente quatro alternativas", () => expect(() => validateGeneratedQuestions({ questions: [{ ...valid, alternatives: ["A", "B", "C"] }] })).toThrow(/quatro/))
  it("rejeita alternativas duplicadas", () => expect(() => validateGeneratedQuestions({ questions: [{ ...valid, alternatives: ["A", "A", "B", "C"] }] })).toThrow(/diferentes/))
  it("rejeita pergunta sem resposta correta válida", () => expect(() => validateGeneratedQuestions({ questions: [{ ...valid, correctAnswerIndex: -1 }] })).toThrow(/única/))
  it("não repete perguntas na seleção", () => expect(selectGameQuestionIds(["a", "a", "b", "c"], 3, () => .5)).toHaveLength(3))
  it("calcula somente a quantidade faltante para o banco de 50", () => { expect(missingQuestionCount(8, 50)).toBe(42); expect(missingQuestionCount(55, 50)).toBe(0) })
  it("não inclui resposta correta em um DTO público", () => { const dto = { id: "q1", statement: valid.statement, alternatives: valid.alternatives }; expect(dto).not.toHaveProperty("correctAnswerIndex") })
  it("funciona sem chave de API", () => expect(hasQuestionGenerationConfig(undefined)).toBe(false))
})
