import type { CodeBattleDifficulty, CodeBattleTopic, LocalCodeBattleQuestion } from "./types"
import { shuffleItems } from "./rules"

const base = (topic: CodeBattleTopic, difficulty: CodeBattleDifficulty, index: number): LocalCodeBattleQuestion => ({
  topic,
  difficulty,
  statement: `${topic} ${difficulty}: qual alternativa descreve melhor o conceito ${index}?`,
  options: [
    `Resposta correta sobre ${topic} ${index}`,
    `Distrator comum ${index}`,
    `Atalho incorreto ${index}`,
    `Definicao incompleta ${index}`,
  ],
  correctOption: 0,
  explanation: `A alternativa correta identifica o comportamento principal de ${topic} sem depender de detalhes enganosos.`,
})

export const localCodeBattleQuestions: LocalCodeBattleQuestion[] = [
  ...Array.from({ length: 10 }, (_, index) => base("LOGIC", index < 4 ? "BEGINNER" : index < 7 ? "INTERMEDIATE" : "ADVANCED", index + 1)),
  ...Array.from({ length: 10 }, (_, index) => base("JAVASCRIPT", index < 4 ? "BEGINNER" : index < 7 ? "INTERMEDIATE" : "ADVANCED", index + 1)),
  ...Array.from({ length: 10 }, (_, index) => base("TYPESCRIPT", index < 4 ? "BEGINNER" : index < 7 ? "INTERMEDIATE" : "ADVANCED", index + 1)),
  ...["REACT", "NODEJS", "SQL", "HTML_CSS"].flatMap((topic) =>
    Array.from({ length: 5 }, (_, index) => base(topic as CodeBattleTopic, "BEGINNER", index + 1)),
  ),
]

export function prepareQuestions(topic: CodeBattleTopic, difficulty: CodeBattleDifficulty, count: number, random = Math.random) {
  const exact = localCodeBattleQuestions.filter((question) => question.topic === topic && question.difficulty === difficulty)
  const fallback = localCodeBattleQuestions.filter((question) => question.topic === topic)
  const pool = exact.length >= count ? exact : fallback
  const selected = shuffleItems(pool, random).slice(0, count)
  if (selected.length < count) throw new Error("Nao existem perguntas suficientes para este tema.")

  return selected.map((question, position) => {
    const options = question.options.map((label, originalIndex) => ({ label, originalIndex }))
    const shuffled = shuffleItems(options, random)
    return {
      position,
      statement: question.statement,
      options: shuffled.map((option) => option.label),
      correctOption: shuffled.findIndex((option) => option.originalIndex === question.correctOption),
      explanation: question.explanation,
      topic: question.topic,
      difficulty: question.difficulty,
    }
  })
}

export function toPublicQuestion<T extends { id: string; position: number; statement: string; options: unknown; topic: CodeBattleTopic; difficulty: CodeBattleDifficulty }>(question: T) {
  return {
    id: question.id,
    position: question.position,
    statement: question.statement,
    options: Array.isArray(question.options) ? question.options.filter((option): option is string => typeof option === "string") : [],
    topic: question.topic,
    difficulty: question.difficulty,
  }
}
