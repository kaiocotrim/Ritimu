import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { CalendarEventType, StudyPlanPeriodType } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

const routineTypes = new Set(["STUDY", "GYM", "WORK", "READING", "REVIEW", "EXAM", "BREAK", "OTHER"])
const recurrences = new Set(["NONE", "WEEKLY", "CUSTOM"])

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

function parseInput(value: unknown) {
  const body = value as Record<string, unknown> | null
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const startAt = typeof body?.startAt === "string" ? new Date(body.startAt) : null
  const endAt = typeof body?.endAt === "string" ? new Date(body.endAt) : null
  const routineType = typeof body?.routineType === "string" && routineTypes.has(body.routineType) ? body.routineType : "OTHER"
  const recurrence = typeof body?.recurrence === "string" && recurrences.has(body.recurrence) ? body.recurrence : "NONE"
  const recurrenceDays = Array.isArray(body?.recurrenceDays)
    ? [...new Set(body.recurrenceDays.map(Number).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6))]
    : []
  const courseId = typeof body?.courseId === "string" && body.courseId ? body.courseId : null
  if (!title || title.length > 200) return { error: "Informe um título de até 200 caracteres." } as const
  if (!startAt || !endAt || Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime()) || endAt <= startAt) return { error: "Informe um horário válido." } as const
  if (endAt.getTime() - startAt.getTime() > 24 * 60 * 60 * 1000) return { error: "O evento deve ter menos de 24 horas." } as const
  if (recurrence === "CUSTOM" && recurrenceDays.length === 0) return { error: "Selecione ao menos um dia para a repetição personalizada." } as const
  if (routineType === "STUDY" && !courseId) return { error: "Selecione uma matéria para a sessão de estudo." } as const
  return { data: { title, startAt, endAt, routineType, recurrence, recurrenceDays, courseId } } as const
}

export async function POST(request: Request) {
  try {
    const id = await userId()
    if (!id) return Response.json({ error: "Não autenticado" }, { status: 401 })
    const parsed = parseInput(await request.json().catch(() => null))
    if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 })
    const { courseId, ...input } = parsed.data

    const course = courseId
      ? await prisma.classroomCourse.findFirst({ where: { id: courseId, userId: id }, select: { id: true, name: true } })
      : null
    if (courseId && !course) return Response.json({ error: "Matéria não encontrada." }, { status: 404 })

    const event = await prisma.$transaction(async (tx) => {
      if (input.routineType !== "STUDY" || !course) {
        return tx.calendarEvent.create({
          data: { userId: id, title: input.title, startAt: input.startAt, endAt: input.endAt, type: input.routineType === "EXAM" ? CalendarEventType.EXAM : CalendarEventType.PERSONAL, routineType: input.routineType, recurrence: input.recurrence, recurrenceDays: input.recurrenceDays },
        })
      }

      const planDate = new Date(input.startAt)
      planDate.setHours(0, 0, 0, 0)
      const plan = await tx.studyPlan.upsert({
        where: { userId_planDate: { userId: id, planDate } },
        create: { userId: id, planDate, periodType: StudyPlanPeriodType.DAILY, startDate: planDate, endDate: planDate, confirmedAt: new Date() },
        update: {},
      })
      const studySession = await tx.studySession.create({
        data: { studyPlanId: plan.id, courseId: course.id, title: input.title, subjectName: course.name, priorityScore: 0, scheduledStart: input.startAt, scheduledEnd: input.endAt, durationMinutes: Math.round((input.endAt.getTime() - input.startAt.getTime()) / 60_000) },
      })
      await tx.studyPlan.update({ where: { id: plan.id }, data: { totalMinutes: { increment: studySession.durationMinutes } } })
      return tx.calendarEvent.create({
        data: { userId: id, studySessionId: studySession.id, title: input.title, startAt: input.startAt, endAt: input.endAt, type: CalendarEventType.STUDY, routineType: "STUDY", recurrence: input.recurrence, recurrenceDays: input.recurrenceDays },
      })
    })
    return Response.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Study planner event creation failed", error)
    return Response.json({ error: "Não foi possível salvar o evento. Atualize a página e tente novamente." }, { status: 500 })
  }
}
