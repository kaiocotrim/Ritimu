export const CODE_BATTLE_TOPICS = ["LOGIC", "JAVASCRIPT", "TYPESCRIPT", "REACT", "NODEJS", "SQL", "HTML_CSS"] as const
export const CODE_BATTLE_DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const

export type CodeBattleTopic = (typeof CODE_BATTLE_TOPICS)[number]
export type CodeBattleDifficulty = (typeof CODE_BATTLE_DIFFICULTIES)[number]

export type LocalCodeBattleQuestion = {
  statement: string
  options: [string, string, string, string]
  correctOption: number
  explanation: string
  difficulty: CodeBattleDifficulty
  topic: CodeBattleTopic
}

export type PublicBattleQuestion = {
  id: string
  position: number
  statement: string
  options: string[]
  topic: CodeBattleTopic
  difficulty: CodeBattleDifficulty
}

export const topicLabels: Record<CodeBattleTopic, string> = {
  LOGIC: "Logica de programacao",
  JAVASCRIPT: "JavaScript",
  TYPESCRIPT: "TypeScript",
  REACT: "React",
  NODEJS: "Node.js",
  SQL: "SQL",
  HTML_CSS: "HTML e CSS",
}

export const difficultyLabels: Record<CodeBattleDifficulty, string> = {
  BEGINNER: "iniciante",
  INTERMEDIATE: "intermediario",
  ADVANCED: "avancado",
}

export function isCodeBattleTopic(value: unknown): value is CodeBattleTopic {
  return typeof value === "string" && CODE_BATTLE_TOPICS.includes(value as CodeBattleTopic)
}

export function isCodeBattleDifficulty(value: unknown): value is CodeBattleDifficulty {
  return typeof value === "string" && CODE_BATTLE_DIFFICULTIES.includes(value as CodeBattleDifficulty)
}
