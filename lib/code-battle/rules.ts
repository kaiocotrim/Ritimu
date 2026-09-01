export function calculateBattlePoints(input: { correct: boolean; responseTimeMs: number; timePerQuestionSeconds: number }) {
  if (!input.correct) return 0
  const limitMs = input.timePerQuestionSeconds * 1000
  const elapsed = Math.max(0, Math.min(input.responseTimeMs, limitMs))
  const speedBonus = Math.round(50 * (1 - elapsed / limitMs))
  return 100 + speedBonus
}

export function isAnswerWithinDeadline(questionStartedAt: Date, timePerQuestionSeconds: number, now = new Date()) {
  return now.getTime() <= questionStartedAt.getTime() + timePerQuestionSeconds * 1000
}

export function chooseWinner(scores: Record<string, number>) {
  const entries = Object.entries(scores)
  if (entries.length < 2) return null
  const [first, second] = entries.sort((a, b) => b[1] - a[1])
  return first[1] === second[1] ? null : first[0]
}

export function average(values: number[]) {
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export function shuffleItems<T>(items: T[], random = Math.random) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const current = result[index]
    result[index] = result[swapIndex]
    result[swapIndex] = current
  }
  return result
}
