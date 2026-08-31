import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"
import { createStudyPlanGoogleEvent, studyPlanGoogleErrorResponse, updateStudyPlanGoogleEvent } from "@/lib/study-plan/google-sync"

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
  const calendarEvent = await prisma.calendarEvent.findFirst({ where: { studySessionId: id, userId } })
  let googleSync
  try {
    const googleInput = { title: calendarEvent?.title ?? `Estudo: ${existing.title}`, description: calendarEvent?.description ?? existing.description, startAt: start, endAt: end }
    googleSync = calendarEvent?.googleEventId
      ? await updateStudyPlanGoogleEvent(userId, calendarEvent.googleEventId, googleInput, calendarEvent.googleCalendarId ?? undefined)
      : await createStudyPlanGoogleEvent(userId, googleInput)
  } catch (error) {
    return studyPlanGoogleErrorResponse(error)
  }
  const session = await prisma.$transaction(async (tx) => {
    const updated = await tx.studySession.update({ where: { id }, data: { scheduledStart: start, scheduledEnd: end, status: "RESCHEDULED" } })
    if (calendarEvent) await tx.calendarEvent.update({ where: { id: calendarEvent.id }, data: { startAt: start, endAt: end, status: "PENDING", ...googleSync } })
    else await tx.calendarEvent.create({ data: { userId, studySessionId: id, title: `Estudo: ${existing.title}`, description: existing.description, startAt: start, endAt: end, source: "RITIMU", type: "STUDY", status: "PENDING", ...googleSync } })
    return updated
  })
  return Response.json({ session })
}
