import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPublicAssessmentQuestions } from "@/lib/roadmaps/full-stack/assessment.server"
import { isAssessmentUnlocked } from "@/lib/roadmaps/full-stack/assessment-rules"
import { FULL_STACK_NODES, readFullStackNodeMetadata } from "@/lib/roadmaps/full-stack/definition"

export async function GET(_request: Request, { params }: { params: Promise<{ roadmapId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const { roadmapId } = await params
  const roadmap = await prisma.studyRoadmap.findFirst({
    where: { id: roadmapId, slug: "full-stack-developer", OR: [{ isPublic: true }, { creatorId: session.user.id }] },
    select: { modules: { select: { lessons: { select: { id: true, sourceMetadata: true, progress: { where: { userId: session.user.id, status: "COMPLETED" }, select: { id: true } } } } } } },
  })
  if (!roadmap) return Response.json({ error: "Roadmap não encontrado." }, { status: 404 })
  const completed = roadmap.modules.flatMap((module) => module.lessons).filter((lesson) => readFullStackNodeMetadata(lesson.sourceMetadata) && lesson.progress.length > 0).length
  if (!isAssessmentUnlocked(completed, FULL_STACK_NODES.length)) return Response.json({ error: "Conclua 100% do conteúdo para desbloquear a avaliação." }, { status: 403 })
  return Response.json({ questions: getPublicAssessmentQuestions(), startedAt: new Date().toISOString() })
}
