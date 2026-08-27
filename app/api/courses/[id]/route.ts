import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const { id } = await params
  const deleted = await prisma.classroomCourse.deleteMany({ where: { id, userId, courseState: "MANUAL" } })
  return deleted.count ? new Response(null, { status: 204 }) : Response.json({ error: "Matéria manual não encontrada." }, { status: 404 })
}
