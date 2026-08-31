export function hasQuestionGenerationConfig(apiKey: string | undefined = process.env.GEMINI_API_KEY) {
  return Boolean(apiKey?.trim())
}
