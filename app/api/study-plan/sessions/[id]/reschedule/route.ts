import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const { id } = await params
  const body = await request.json().catch(() => null) as { scheduledStart?: unknown } | null
  const start = typeof body?.scheduledStart === "string" ? new Date(body.scheduledStart) : null
  if (!start || Number.isNaN(start.getTime()) || start < new Date()) return Response.json({ error: "Escolha uma data futura válida." }, { status: 400 })
  const existing = await prisma.studySession.findFirst({ where: { id, studyPlan: { userId } } })
  if (!existing) return Response.json({ error: "Sessão não encontrada." }, { status: 404 })
  const duration = existing.scheduledEnd.getTime() - existing.scheduledStart.getTime()
  const end = new Date(start.getTime() + duration)
  const session = await prisma.$transaction(async (tx) => {
    const updated = await tx.studySession.update({ where: { id }, data: { scheduledStart: start, scheduledEnd: end, status: "RESCHEDULED" } })
    await tx.calendarEvent.updateMany({ where: { studySessionId: id, userId }, data: { startAt: start, endAt: end, status: "PENDING" } })
    return updated
  })
  return Response.json({ session })
}
