import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { awardXp, XP_REWARDS, XpSource } from "@/lib/gamification"
import { CalendarEventStatus, StudySessionStatus } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { getDateKey, getDayRange } from "@/lib/study-plan/today"

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = await userId()
  if (!id) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const eventId = (await params).id
  const existing = await prisma.calendarEvent.findFirst({ where: { id: eventId, userId: id }, include: { studySession: true } })
  if (!existing) return Response.json({ error: "Evento não encontrado." }, { status: 404 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return Response.json({ error: "Dados inválidos." }, { status: 400 })

  if (typeof body.completed === "boolean") {
    const completed = body.completed
    const occurrenceKey = typeof body.occurrenceDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.occurrenceDate)
      ? body.occurrenceDate
      : getDateKey()
    const occurrenceDate = getDayRange(new Date(`${occurrenceKey}T12:00:00-03:00`)).start

    const event = await prisma.$transaction(async (tx) => {
      if (completed) {
        await tx.calendarEventDayCompletion.upsert({
          where: { calendarEventId_occurrenceDate: { calendarEventId: eventId, occurrenceDate } },
          update: { completedAt: new Date() },
          create: { userId: id, calendarEventId: eventId, occurrenceDate },
        })
      } else {
        await tx.calendarEventDayCompletion.deleteMany({ where: { userId: id, calendarEventId: eventId, occurrenceDate } })
      }

      if (existing.studySessionId && existing.recurrence === "NONE") {
        await tx.studySession.update({
          where: { id: existing.studySessionId },
          data: { status: completed ? StudySessionStatus.COMPLETED : StudySessionStatus.PENDING, completedAt: completed ? new Date() : null },
        })
        if (completed) {
          await awardXp(tx, {
            userId: id,
            amount: XP_REWARDS.studySession,
            source: XpSource.STUDY_SESSION,
            referenceId: existing.studySessionId,
            description: "Sessão de estudo concluída",
          })
        }
      }

      return tx.calendarEvent.update({
        where: { id: eventId },
        data: {
          status: existing.recurrence === "NONE"
            ? completed ? CalendarEventStatus.COMPLETED : CalendarEventStatus.PENDING
            : CalendarEventStatus.PENDING,
        },
      })
    })
    return Response.json({ event })
  }

  const title = typeof body.title === "string" ? body.title.trim() : existing.title
  const startAt = typeof body.startAt === "string" ? new Date(body.startAt) : existing.startAt
  const endAt = typeof body.endAt === "string" ? new Date(body.endAt) : existing.endAt
  if (!title || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) return Response.json({ error: "Título ou horário inválido." }, { status: 400 })
  const recurrence = typeof body.recurrence === "string" && ["NONE", "WEEKLY", "CUSTOM"].includes(body.recurrence) ? body.recurrence : existing.recurrence
  const recurrenceDays = Array.isArray(body.recurrenceDays) ? body.recurrenceDays.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6) : existing.recurrenceDays
  const courseId = typeof body.courseId === "string" ? body.courseId : existing.studySession?.courseId
  const course = courseId ? await prisma.classroomCourse.findFirst({ where: { id: courseId, userId: id }, select: { id: true, name: true } }) : null
  if (existing.studySessionId && !course) return Response.json({ error: "Selecione uma matéria válida." }, { status: 400 })

  const event = await prisma.$transaction(async (tx) => {
    if (existing.studySessionId && course) await tx.studySession.update({ where: { id: existing.studySessionId }, data: { title, courseId: course.id, subjectName: course.name, scheduledStart: startAt, scheduledEnd: endAt, durationMinutes: Math.round((endAt.getTime() - startAt.getTime()) / 60_000) } })
    return tx.calendarEvent.update({ where: { id: eventId }, data: { title, startAt, endAt, recurrence, recurrenceDays } })
  })
  return Response.json({ event })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = await userId()
  if (!id) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const eventId = (await params).id
  const existing = await prisma.calendarEvent.findFirst({ where: { id: eventId, userId: id }, select: { id: true, studySessionId: true } })
  if (!existing) return Response.json({ error: "Evento não encontrado." }, { status: 404 })
  if (existing.studySessionId) await prisma.studySession.delete({ where: { id: existing.studySessionId } })
  else await prisma.calendarEvent.delete({ where: { id: eventId } })
  return new Response(null, { status: 204 })
}
