import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"
import { parseStudyContent } from "@/lib/study-plan/validation"

export async function GET() {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  return Response.json({ contents: await prisma.studyContent.findMany({ where: { userId }, include: { course: { select: { name: true } } }, orderBy: [{ studied: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }] }) })
}

export async function POST(request: Request) {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const parsed = parseStudyContent(await request.json().catch(() => null))
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 })
  if (parsed.data.courseId) {
    const owned = await prisma.classroomCourse.findFirst({ where: { id: parsed.data.courseId, userId }, select: { id: true } })
    if (!owned) return Response.json({ error: "Disciplina não encontrada." }, { status: 404 })
  }
  const content = await prisma.studyContent.create({ data: { ...parsed.data, userId } })
  return Response.json({ content }, { status: 201 })
}
