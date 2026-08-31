import { createHash } from "node:crypto"

export type GeneratedQuestion = { statement: string; alternatives: string[]; correctAnswerIndex: number; explanation: string }

export function questionFingerprint(statement: string, alternatives: string[]) {
  const value = `${statement.trim().toLocaleLowerCase("pt-BR")}|${alternatives.map((item) => item.trim().toLocaleLowerCase("pt-BR")).sort().join("|")}`
  return createHash("sha256").update(value).digest("hex")
}

export function validateGeneratedQuestions(input: unknown, expectedMaximum = 12, expectedMinimum = 0): GeneratedQuestion[] {
  const value = input as { questions?: unknown } | null
  if (!value || !Array.isArray(value.questions) || value.questions.length < expectedMinimum || value.questions.length > expectedMaximum) throw new Error("Lote de perguntas inválido.")
  const fingerprints = new Set<string>()
  return value.questions.map((raw) => {
    const item = raw as Partial<GeneratedQuestion> | null
    if (!item || typeof item.statement !== "string" || item.statement.trim().length < 8 || item.statement.length > 300) throw new Error("Enunciado inválido.")
    if (!Array.isArray(item.alternatives) || item.alternatives.length !== 4 || item.alternatives.some((answer) => typeof answer !== "string" || !answer.trim())) throw new Error("Cada pergunta deve possuir exatamente quatro alternativas.")
    const alternatives = item.alternatives.map((answer) => answer.trim())
    if (new Set(alternatives.map((answer) => answer.toLocaleLowerCase("pt-BR"))).size !== 4) throw new Error("As alternativas devem ser diferentes.")
    if (!Number.isInteger(item.correctAnswerIndex) || item.correctAnswerIndex! < 0 || item.correctAnswerIndex! > 3) throw new Error("A pergunta deve possuir uma única resposta correta.")
    if (typeof item.explanation !== "string" || !item.explanation.trim() || item.explanation.length > 400) throw new Error("Explicação inválida.")
    const fingerprint = questionFingerprint(item.statement, alternatives)
    if (fingerprints.has(fingerprint)) throw new Error("O lote contém perguntas repetidas.")
    fingerprints.add(fingerprint)
    return { statement: item.statement.trim(), alternatives, correctAnswerIndex: item.correctAnswerIndex!, explanation: item.explanation.trim() }
  })
}
