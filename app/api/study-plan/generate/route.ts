import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"
import { scheduleSessions } from "@/lib/study-plan/schedule-sessions"

export async function POST() {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const [preference, availability, assignments] = await Promise.all([
    prisma.studyPreference.findUnique({ where: { userId } }),
    prisma.studyAvailability.findMany({ where: { userId } }),
    prisma.classroomAssignment.findMany({ where: { course: { userId }, state: { not: "DELETED" } }, include: { course: { include: { studyPreferences: { where: { userId } } } } } }),
  ])
  if (!preference || !availability.length) return Response.json({ error: "Configure sua disponibilidade antes de gerar o plano.", code: "PREFERENCES_REQUIRED" }, { status: 400 })
  if (!assignments.length) return Response.json({ error: "Sincronize o Google Classroom para importar suas atividades antes de gerar o plano.", code: "CLASSROOM_SYNC_REQUIRED" }, { status: 400 })
  const completions = await prisma.classroomItemCompletion.findMany({ where: { userId, itemKey: { startsWith: "coursework:" }, completed: true }, select: { itemKey: true } })
  const completed = new Set(completions.map((item) => item.itemKey.replace("coursework:", "")))
  const completedStudySessions = await prisma.studySession.findMany({ where: { studyPlan: { userId }, status: "COMPLETED", classroomAssignmentId: { not: null } }, select: { classroomAssignmentId: true } })
  const completedAssignmentIds = new Set(completedStudySessions.map((item) => item.classroomAssignmentId))
  const startDate = new Date(); startDate.setHours(0, 0, 0, 0)
  const sessions = scheduleSessions({ startDate, availability, sessionMinutes: preference.defaultSessionMinutes, breakMinutes: preference.breakMinutes, maxDailyMinutes: preference.maxDailyMinutes, tasks: assignments.map((item) => ({ id: item.id, title: item.title, description: item.description, subjectId: item.courseId, subjectName: item.course.name, dueAt: item.dueDate, difficulty: item.course.studyPreferences[0]?.difficulty ?? 3, importance: item.importance, estimatedMinutes: item.estimatedMinutes, completed: completed.has(item.googleAssignmentId) || completedAssignmentIds.has(item.id), externalUrl: item.classroomUrl })) })
  if (!sessions.length) return Response.json({ error: "Todas as atividades estão concluídas ou os horários configurados não comportam uma sessão completa.", code: "NO_AVAILABLE_SESSIONS" }, { status: 400 })
  const byDay = new Map<string, typeof sessions>()
  for (const session of sessions) { const day = new Date(session.scheduledStart); day.setHours(0, 0, 0, 0); const key = day.toISOString(); byDay.set(key, [...(byDay.get(key) ?? []), session]) }
  await prisma.$transaction(async (tx) => {
    for (const [date, daySessions] of byDay) {
      const plan = await tx.studyPlan.upsert({ where: { userId_planDate: { userId, planDate: new Date(date) } }, create: { userId, planDate: new Date(date), totalMinutes: daySessions.length * preference.defaultSessionMinutes }, update: { totalMinutes: daySessions.length * preference.defaultSessionMinutes } })
      await tx.studySession.deleteMany({ where: { studyPlanId: plan.id, status: { in: ["PENDING", "MISSED", "RESCHEDULED"] } } })
      for (const item of daySessions) {
        const studySession = await tx.studySession.create({ data: { studyPlanId: plan.id, courseId: item.subjectId, classroomAssignmentId: item.id, externalTaskId: item.id, externalUrl: item.externalUrl, title: item.title, description: item.description, subjectName: item.subjectName, priorityReason: item.priorityReason, priorityScore: item.priorityScore, scheduledStart: item.scheduledStart, scheduledEnd: item.scheduledEnd } })
        await tx.calendarEvent.create({ data: { userId, studySessionId: studySession.id, classroomAssignmentId: item.id, title: `Estudo: ${item.title}`, description: `${item.subjectName} — ${item.priorityReason}`, startAt: item.scheduledStart, endAt: item.scheduledEnd, source: "RITIMU", type: "STUDY", status: "PENDING" } })
      }
    }
  })
  return Response.json({ sessions: sessions.length })
}
