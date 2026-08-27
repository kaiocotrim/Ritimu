import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"

export async function POST(request: Request) {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })

  const body = await request.json().catch(() => null)
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const section = typeof body?.section === "string" ? body.section.trim() : ""
  if (name.length < 2) return Response.json({ error: "Informe um nome para a matéria." }, { status: 400 })
  if (name.length > 100 || section.length > 120) return Response.json({ error: "Nome ou descrição muito longos." }, { status: 400 })

  const course = await prisma.classroomCourse.create({
    data: {
      userId,
      googleCourseId: `manual:${crypto.randomUUID()}`,
      name,
      section: section || "Estudo pessoal",
      courseState: "MANUAL",
    },
    select: { id: true },
  })

  return Response.json({ course }, { status: 201 })
}
