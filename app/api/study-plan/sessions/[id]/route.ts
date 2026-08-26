import { StudySessionStatus } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => null) as { status?: unknown } | null
  const status = typeof body?.status === "string" && Object.values(StudySessionStatus).includes(body.status as StudySessionStatus) ? body.status as StudySessionStatus : null
  if (!status) return Response.json({ error: "Estado inválido." }, { status: 400 })
  const owned = await prisma.studySession.findFirst({ where: { id, studyPlan: { userId } }, select: { id: true } })
  if (!owned) return Response.json({ error: "Sessão não encontrada." }, { status: 404 })
  const session = await prisma.$transaction(async (tx) => {
    const updated = await tx.studySession.update({ where: { id }, data: { status, completedAt: status === "COMPLETED" ? new Date() : null } })
    await tx.calendarEvent.updateMany({ where: { studySessionId: id, userId }, data: { status: status === "COMPLETED" ? "COMPLETED" : status === "MISSED" ? "CANCELED" : "PENDING" } })
    return updated
  })
  return Response.json({ session })
}
