import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"
import { parseStudyContent } from "@/lib/study-plan/validation"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getStudyPlanUserId(); if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const { id } = await params
  const existing = await prisma.studyContent.findFirst({ where: { id, userId } })
  if (!existing) return Response.json({ error: "Conteúdo não encontrado." }, { status: 404 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  const parsed = parseStudyContent({ title: body?.title ?? existing.title, description: body?.description ?? existing.description, courseId: body?.courseId === undefined ? existing.courseId : body.courseId, dueDate: body?.dueDate === undefined ? existing.dueDate?.toISOString() : body.dueDate, importance: body?.importance ?? existing.importance, estimatedMinutes: body?.estimatedMinutes ?? existing.estimatedMinutes, studied: body?.studied ?? existing.studied })
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 })
  if (parsed.data.courseId && !(await prisma.classroomCourse.findFirst({ where: { id: parsed.data.courseId, userId }, select: { id: true } }))) return Response.json({ error: "Disciplina não encontrada." }, { status: 404 })
  return Response.json({ content: await prisma.studyContent.update({ where: { id }, data: parsed.data }) })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getStudyPlanUserId(); if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const { id } = await params
  const deleted = await prisma.studyContent.deleteMany({ where: { id, userId } })
  return deleted.count ? new Response(null, { status: 204 }) : Response.json({ error: "Conteúdo não encontrado." }, { status: 404 })
}
