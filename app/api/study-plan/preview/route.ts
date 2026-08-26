import { prisma } from "@/lib/prisma"
import { getGoogleCalendarConnection } from "@/lib/google-calendar"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"
import { generateStudyPlanPreview } from "@/lib/study-plan/generate-preview"
import type { StudyTask } from "@/lib/study-plan/types"
import { parsePlanningPeriod } from "@/lib/study-plan/validation"

function isExam(title: string, workType: string | null) {
  return /\b(prova|exame|avaliação|quiz)\b/i.test(title) || /QUIZ|TEST|EXAM/i.test(workType ?? "")
}

export async function POST(request: Request) {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const parsed = parsePlanningPeriod(await request.json().catch(() => null))
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 })

  const [preference, availability, assignments, contents, completions, completedSessions] = await Promise.all([
    prisma.studyPreference.findUnique({ where: { userId } }),
    prisma.studyAvailability.findMany({ where: { userId } }),
    prisma.classroomAssignment.findMany({ where: { course: { userId }, state: { not: "DELETED" } }, include: { course: { include: { studyPreferences: { where: { userId } } } } } }),
    prisma.studyContent.findMany({ where: { userId, studied: false }, include: { course: { include: { studyPreferences: { where: { userId } } } } } }),
    prisma.classroomItemCompletion.findMany({ where: { userId, completed: true, itemKey: { startsWith: "coursework:" } }, select: { itemKey: true } }),
    prisma.studySession.findMany({ where: { studyPlan: { userId }, status: "COMPLETED", classroomAssignmentId: { not: null } }, select: { classroomAssignmentId: true } }),
  ])
  if (!preference || !availability.length) return Response.json({ error: "Configure sua disponibilidade antes de criar a prévia.", code: "PREFERENCES_REQUIRED" }, { status: 400 })

  const completedGoogleIds = new Set(completions.map((item) => item.itemKey.replace("coursework:", "")))
  const completedAssignmentIds = new Set(completedSessions.map((item) => item.classroomAssignmentId))
  const tasks: StudyTask[] = [
    ...assignments.map((item) => ({ id: `assignment:${item.id}`, title: item.title, description: item.description, subjectId: item.courseId, subjectName: item.course.name, dueAt: item.dueDate, difficulty: item.course.studyPreferences[0]?.difficulty ?? 3, importance: item.importance, estimatedMinutes: item.estimatedMinutes, completed: completedGoogleIds.has(item.googleAssignmentId) || completedAssignmentIds.has(item.id), externalUrl: item.classroomUrl, kind: isExam(item.title, item.workType) ? "EXAM" as const : "ASSIGNMENT" as const })),
    ...contents.map((item) => ({ id: `content:${item.id}`, title: item.title, description: item.description, subjectId: item.courseId, subjectName: item.course?.name ?? "Estudos gerais", dueAt: item.dueDate, difficulty: item.course?.studyPreferences[0]?.difficulty ?? 3, importance: item.importance, estimatedMinutes: item.estimatedMinutes, completed: item.studied, studied: item.studied, kind: "CONTENT" as const })),
  ]
  if (!tasks.some((item) => !item.completed)) return Response.json({ error: "Não há atividades ou conteúdos pendentes para planejar.", code: "NO_PENDING_CONTENT" }, { status: 400 })

  const availableDays = preference.studyOnWeekends ? availability : availability.filter((item) => item.weekday !== 0 && item.weekday !== 6)
  const preview = generateStudyPlanPreview({ tasks, availability: availableDays, startDate: parsed.data.startDate, endDate: parsed.data.endDate, now: new Date(), sessionMinutes: preference.defaultSessionMinutes, breakMinutes: preference.breakMinutes, maxDailyMinutes: preference.maxDailyMinutes })
  const wantsGoogle = parsed.data.syncWithGoogle || preference.syncWithGoogleDefault
  const google = wantsGoogle ? await getGoogleCalendarConnection(userId) : null
  const warnings = [
    ...(preview.unscheduled.length ? [`${preview.unscheduled.length} conteúdo(s) não couberam no período.`] : []),
    ...(wantsGoogle && !google?.connected ? ["O Google Calendar precisa ser conectado antes da confirmação."] : []),
  ]
  return Response.json({ preview, period: parsed.data, syncWithGoogle: wantsGoogle, googleConnected: google?.connected ?? false, warnings })
}
