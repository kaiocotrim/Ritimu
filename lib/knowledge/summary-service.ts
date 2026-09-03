import "server-only"

import type { ExtractedMaterialContent } from "@/lib/material-content/types"

type SummaryContent = { title: string; overview: string; keyConcepts: string[]; definitions: string[]; examples: string[]; importantPoints: string[]; reviewQuestions: string[] }

export class SummaryServiceError extends Error {}

export async function generateStudySummary(material: ExtractedMaterialContent): Promise<SummaryContent> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new SummaryServiceError("A geração de resumos não está configurada.")
  if (material.text.length > 100_000) throw new SummaryServiceError("Este material é grande demais para o primeiro MVP.")
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_QUESTION_MODEL ?? "gemini-flash-lite-latest")}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: `Crie um resumo de estudo em português do Brasil usando SOMENTE o material abaixo. Não invente informações. Retorne apenas JSON válido com title, overview, keyConcepts, definitions, examples, importantPoints e reviewQuestions.\n\nTítulo: ${material.title}\nMaterial:\n${material.text}` }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2 } }),
    cache: "no-store",
  })
  const data = await response.json().catch(() => null) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>; error?: { message?: string } } | null
  if (!response.ok) throw new SummaryServiceError(data?.error?.message ?? "O Gemini não conseguiu gerar o resumo.")
  const output = data?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim()
  if (!output) throw new SummaryServiceError("O Gemini retornou um resumo vazio.")
  try {
    const parsed = JSON.parse(output) as SummaryContent
    if (typeof parsed.title !== "string" || typeof parsed.overview !== "string" || !Array.isArray(parsed.keyConcepts) || !Array.isArray(parsed.definitions) || !Array.isArray(parsed.examples) || !Array.isArray(parsed.importantPoints) || !Array.isArray(parsed.reviewQuestions)) throw new Error()
    return parsed
  } catch {
    throw new SummaryServiceError("O Gemini retornou um formato de resumo inválido.")
  }
}