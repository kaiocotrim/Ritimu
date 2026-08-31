export function selectGameQuestionIds(ids: string[], count: number, random = Math.random) {
  const unique = [...new Set(ids)]
  for (let index = unique.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    ;[unique[index], unique[target]] = [unique[target], unique[index]]
  }
  return unique.slice(0, Math.max(0, count))
}

export function missingQuestionCount(available: number, required: number) {
  return Math.max(0, required - available)
}
