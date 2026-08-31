export const POPULAR_TOPICS = ["Futebol", "Programação", "História", "Geografia", "Matemática", "Ciências", "Conhecimentos gerais", "Jiu-jítsu"] as const

const canonicalTopics = new Map([
  ["treino de jiu", "Treinamento de jiu-jítsu"],
  ["treino de jiu jitsu", "Treinamento de jiu-jítsu"],
  ["jiu jitsu", "Jiu-jítsu"],
  ["programacao", "Programação"],
  ["ciencias", "Ciências"],
])

export function comparisonValue(value: string) {
  return value.trim().replace(/\s+/g, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, " ").trim().toLocaleLowerCase("pt-BR")
}

export function normalizeTopic(input: string) {
  const name = input.trim().replace(/\s+/g, " ")
  if (name.length < 3) throw new Error("O tema deve ter pelo menos 3 caracteres.")
  if (name.length > 80) throw new Error("O tema deve ter no máximo 80 caracteres.")
  if (!/[\p{L}\p{N}]/u.test(name)) throw new Error("Informe um tema válido.")
  const normalizedName = comparisonValue(name)
  const suggestion = canonicalTopics.get(normalizedName) ?? null
  const slug = normalizedName.replace(/\s+/g, "-").replace(/^-+|-+$/g, "")
  return { name, normalizedName, slug, suggestion }
}

export function suggestedSubtopics(topic: string) {
  const normalized = comparisonValue(topic)
  if (normalized.includes("jiu jitsu")) return ["Conhecimentos gerais", "História", "Regras esportivas", "Faixas", "Pontuação", "Posições", "Competições"]
  if (normalized.includes("futebol")) return ["Conhecimentos gerais", "História", "Regras", "Competições", "Clubes e seleções"]
  if (normalized.includes("programacao") || normalized.includes("javascript")) return ["Fundamentos", "Sintaxe", "Web", "Algoritmos", "Boas práticas"]
  return ["Conhecimentos gerais"]
}
