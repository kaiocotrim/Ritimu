import "server-only"

import { geminiService, GeminiServiceError } from "./gemini-service"
import type { GeneratedQuestion } from "./validate-generated-questions"

export class QuestionGenerationUnavailable extends Error {}

export async function generateQuestions(input: { topic: string; subtopic?: string | null; difficulty: "EASY" | "MEDIUM" | "HARD"; count: number; signal?: AbortSignal }): Promise<GeneratedQuestion[]> {
  try {
    return await geminiService.generateQuestions(input)
  } catch (error) {
    if (error instanceof GeminiServiceError && error.reason === "NOT_CONFIGURED") {
      throw new QuestionGenerationUnavailable(error.message)
    }
    throw error
  }
}
