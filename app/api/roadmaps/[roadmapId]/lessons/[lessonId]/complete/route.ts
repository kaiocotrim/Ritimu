import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { completeRoadmapLesson } from "@/lib/roadmaps/service"

export async function POST(_request: Request, { params }: { params: Promise<{ roadmapId: string; lessonId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const { roadmapId, lessonId } = await params
  try {
    await completeRoadmapLesson(session.user.id, roadmapId, lessonId)
    return Response.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível concluir a etapa."
    return Response.json({ error: message }, { status: message.includes("pré-requisitos") ? 409 : 404 })
  }
}
