import "server-only"

import { validateGeneratedQuestions, type GeneratedQuestion } from "./validate-generated-questions"

type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD"

type GeminiQuestion = {
  question: string
  alternatives: string[]
  correctIndex: number
  difficulty: "easy" | "medium" | "hard"
  category: string
  explanation: string
}

type GeminiResponse = {
  candidates?: Array<{
    finishReason?: string
    content?: { parts?: Array<{ text?: string }> }
  }>
  promptFeedback?: { blockReason?: string }
  error?: { message?: string; status?: string }
}

export class GeminiServiceError extends Error {
  constructor(message: string, public readonly reason: "NOT_CONFIGURED" | "TIMEOUT" | "PROVIDER" | "INVALID_RESPONSE") {
    super(message)
    this.name = "GeminiServiceError"
  }
}

const difficultyMap = { EASY: "easy", MEDIUM: "medium", HARD: "hard" } as const

const responseSchema = (count: number) => ({
  type: "array",
  minItems: count,
  maxItems: count,
  items: {
    type: "object",
    additionalProperties: false,
    required: ["question", "alternatives", "correctIndex", "difficulty", "category", "explanation"],
    properties: {
      question: { type: "string", description: "Pergunta objetiva em português do Brasil." },
      alternatives: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
      correctIndex: { type: "integer", minimum: 0, maximum: 3 },
      difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
      category: { type: "string" },
      explanation: { type: "string" },
    },
  },
})

export class GeminiService {
  private readonly apiKey: string | undefined
  private readonly model: string

  constructor(config: { apiKey?: string; model?: string } = {}) {
    this.apiKey = config.apiKey ?? process.env.GEMINI_API_KEY
    this.model = config.model ?? process.env.GEMINI_QUESTION_MODEL ?? "gemini-flash-lite-latest"
  }

  isConfigured() {
    return Boolean(this.apiKey?.trim())
  }

  async generateQuestions(input: { topic: string; subtopic?: string | null; difficulty: QuestionDifficulty; count: number; signal?: AbortSignal }): Promise<GeneratedQuestion[]> {
    if (!this.isConfigured() || !this.apiKey) {
      throw new GeminiServiceError("A geração automática de perguntas não está configurada.", "NOT_CONFIGURED")
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)
    const signal = input.signal ? AbortSignal.any([input.signal, controller.signal]) : controller.signal
    const expectedDifficulty = difficultyMap[input.difficulty]
    const category = input.subtopic?.trim() || input.topic.trim()

    try {
      const requestBody = JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: [
              `Gere exatamente ${input.count} perguntas objetivas em português do Brasil sobre o tema \"${input.topic}\".`,
              input.subtopic ? `Subtema: \"${input.subtopic}\".` : "",
              `Todas devem ter dificuldade \"${expectedDifficulty}\" e categoria \"${category}\".`,
              "Cada pergunta deve ter exatamente quatro alternativas distintas e apenas uma correta.",
              "A explicação deve ser curta, educativa e justificar a alternativa correta.",
              "Não use opiniões, fatos voláteis, pegadinhas ou conteúdo perigoso.",
              "Responda somente com o array JSON solicitado, sem Markdown e sem texto adicional.",
            ].filter(Boolean).join("\n") }],
          }],
          generationConfig: {
            responseMimeType: "application/json",
            responseJsonSchema: responseSchema(input.count),
            temperature: 0.7,
          },
        })
      const models = [...new Set([this.model, "gemini-flash-lite-latest", "gemini-3.1-flash-lite"])]
      let response: Response | null = null
      let data: GeminiResponse | null = null
      for (const model of models) {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
          signal,
          body: requestBody,
        })
        data = await response.json().catch(() => null) as GeminiResponse | null
        if (response.ok || response.status !== 404) break
        console.warn("Gemini model unavailable; trying fallback", { model, status: response.status })
      }

      const outputText = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim()
      if (!response?.ok || !outputText) {
        console.error("Gemini question generation request failed", {
          status: response?.status,
          providerStatus: data?.error?.status,
          finishReason: data?.candidates?.[0]?.finishReason,
          blockReason: data?.promptFeedback?.blockReason,
        })
        throw new GeminiServiceError("O Gemini não conseguiu gerar as perguntas agora. Tente novamente em alguns instantes.", "PROVIDER")
      }

      let parsed: unknown
      try {
        parsed = JSON.parse(outputText)
      } catch {
        throw new GeminiServiceError("O Gemini retornou perguntas em um formato inválido. Tente novamente.", "INVALID_RESPONSE")
      }

      if (!Array.isArray(parsed) || parsed.length !== input.count) {
        throw new GeminiServiceError("O Gemini retornou uma quantidade inválida de perguntas. Tente novamente.", "INVALID_RESPONSE")
      }

      const normalized = parsed.map((raw) => {
        const item = raw as Partial<GeminiQuestion>
        if (item.difficulty !== expectedDifficulty || typeof item.category !== "string" || !item.category.trim()) {
          throw new GeminiServiceError("O Gemini retornou perguntas fora da configuração escolhida.", "INVALID_RESPONSE")
        }
        return {
          statement: item.question,
          alternatives: item.alternatives,
          correctAnswerIndex: item.correctIndex,
          explanation: item.explanation,
        }
      })

      try {
        return validateGeneratedQuestions({ questions: normalized }, input.count, input.count)
      } catch {
        throw new GeminiServiceError("O Gemini retornou perguntas inválidas. Tente novamente.", "INVALID_RESPONSE")
      }
    } catch (error) {
      if (error instanceof GeminiServiceError) throw error
      if (error instanceof Error && error.name === "AbortError") {
        throw new GeminiServiceError("A geração de perguntas demorou mais que o esperado. Tente novamente.", "TIMEOUT")
      }
      console.error("Gemini question generation failed", { reason: error instanceof Error ? error.name : "unknown" })
      throw new GeminiServiceError("Não foi possível conectar ao Gemini agora. Tente novamente.", "PROVIDER")
    } finally {
      clearTimeout(timeout)
    }
  }
}

export const geminiService = new GeminiService()
