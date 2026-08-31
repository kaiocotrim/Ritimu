import { requireX1UserId } from "@/lib/x1/auth"
import { prisma } from "@/lib/prisma"
import { comparisonValue, normalizeTopic, POPULAR_TOPICS, suggestedSubtopics } from "@/lib/knowledge/normalize-topic"

const topicDto = (topic: { id: string; name: string; slug: string }) => ({ ...topic, subtopics: suggestedSubtopics(topic.name) })

export async function GET(request: Request) {
  if (!await requireX1UserId()) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const query = new URL(request.url).searchParams.get("q") ?? ""
  try {
    const normalized = comparisonValue(query)
    const topics = await prisma.knowledgeTopic.findMany({ where: { active: true, ...(normalized ? { normalizedName: { contains: normalized } } : { name: { in: [...POPULAR_TOPICS] } }) }, select: { id: true, name: true, slug: true }, orderBy: { name: "asc" }, take: 8 })
    return Response.json({ topics: topics.map(topicDto) })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Pesquisa inválida." }, { status: 400 })
  }
}

export async function POST(request: Request) {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const body = await request.json().catch(() => null) as { name?: unknown; choice?: unknown } | null
  try {
    const normalized = normalizeTopic(typeof body?.name === "string" ? body.name : "")
    if (normalized.suggestion && body?.choice !== "SUGGESTION" && body?.choice !== "ORIGINAL") return Response.json({ confirmationRequired: true, original: normalized.name, suggestion: normalized.suggestion })
    const chosen = body?.choice === "SUGGESTION" && normalized.suggestion ? normalizeTopic(normalized.suggestion) : normalized
    const topic = await prisma.knowledgeTopic.upsert({ where: { normalizedName: chosen.normalizedName }, create: { name: chosen.name, normalizedName: chosen.normalizedName, slug: chosen.slug, createdById: userId }, update: { active: true }, select: { id: true, name: true, slug: true } })
    return Response.json({ topic: topicDto(topic) }, { status: 201 })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível criar o tema." }, { status: 400 })
  }
}
