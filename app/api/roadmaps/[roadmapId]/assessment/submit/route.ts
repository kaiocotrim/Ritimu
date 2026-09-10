import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { areCompleteAssessmentAnswers, gradeFullStackAssessment } from "@/lib/roadmaps/full-stack/assessment.server"
import { isAssessmentUnlocked } from "@/lib/roadmaps/full-stack/assessment-rules"
import { FULL_STACK_NODES, readFullStackNodeMetadata } from "@/lib/roadmaps/full-stack/definition"

export async function POST(request: Request, { params }: { params: Promise<{ roadmapId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const { roadmapId } = await params
  const body = await request.json().catch(() => null) as { answers?: unknown; startedAt?: unknown } | null
  if (!body || !body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) return Response.json({ error: "Respostas inválidas." }, { status: 400 })
  const answers = Object.fromEntries(Object.entries(body.answers as Record<string, unknown>).filter((entry): entry is [string, number] => Number.isInteger(entry[1]) && Number(entry[1]) >= 0 && Number(entry[1]) <= 3))
  if (!areCompleteAssessmentAnswers(answers)) return Response.json({ error: "Responda exatamente as 50 questões." }, { status: 400 })
  const roadmap = await prisma.studyRoadmap.findFirst({
    where: { id: roadmapId, slug: "full-stack-developer", OR: [{ isPublic: true }, { creatorId: session.user.id }] },
    select: { modules: { select: { lessons: { select: { sourceMetadata: true, progress: { where: { userId: session.user.id, status: "COMPLETED" }, select: { id: true } } } } } } },
  })
  if (!roadmap) return Response.json({ error: "Roadmap não encontrado." }, { status: 404 })
  const completed = roadmap.modules.flatMap((module) => module.lessons).filter((lesson) => readFullStackNodeMetadata(lesson.sourceMetadata) && lesson.progress.length > 0).length
  if (!isAssessmentUnlocked(completed, FULL_STACK_NODES.length)) return Response.json({ error: "Avaliação bloqueada." }, { status: 403 })
  const result = gradeFullStackAssessment(answers)
  const parsedStart = typeof body.startedAt === "string" ? new Date(body.startedAt) : new Date()
  const startedAt = Number.isNaN(parsedStart.getTime()) ? new Date() : parsedStart
  await prisma.$transaction(async (tx) => {
    await tx.roadmapAssessmentAttempt.create({ data: { userId: session.user.id, roadmapId, ...result, answers, startedAt } })
    if (result.passed) await tx.roadmapEnrollment.upsert({ where: { userId_roadmapId: { userId: session.user.id, roadmapId } }, update: { completedAt: new Date() }, create: { userId: session.user.id, roadmapId, completedAt: new Date() } })
  })
  return Response.json(result)
}
