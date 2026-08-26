import { StudyPlanPeriodType } from "@/lib/generated/prisma/enums"

export function parsePlanningPeriod(value: unknown) {
  const body = value as { periodType?: unknown; startDate?: unknown; endDate?: unknown; syncWithGoogle?: unknown } | null
  const supportedPeriodTypes: StudyPlanPeriodType[] = [StudyPlanPeriodType.WEEKLY, StudyPlanPeriodType.MONTHLY, StudyPlanPeriodType.CUSTOM]
  const periodType = typeof body?.periodType === "string" && supportedPeriodTypes.includes(body.periodType as StudyPlanPeriodType) ? body.periodType as StudyPlanPeriodType : null
  const requestedStart = typeof body?.startDate === "string" ? new Date(body.startDate) : null
  const requestedEnd = typeof body?.endDate === "string" ? new Date(body.endDate) : null
  if (!periodType || !requestedStart || Number.isNaN(requestedStart.getTime())) return { error: "Período inicial inválido." } as const
  const startDate = new Date(requestedStart); startDate.setHours(0, 0, 0, 0)
  let endDate: Date
  if (periodType === StudyPlanPeriodType.WEEKLY) { endDate = new Date(startDate); endDate.setDate(endDate.getDate() + 6) }
  else if (periodType === StudyPlanPeriodType.MONTHLY) { startDate.setDate(1); endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999) }
  else { if (!requestedEnd || Number.isNaN(requestedEnd.getTime())) return { error: "Data final inválida." } as const; endDate = new Date(requestedEnd); endDate.setHours(23, 59, 59, 999) }
  const today = new Date(); today.setHours(0, 0, 0, 0)
  if (endDate < today || endDate < startDate) return { error: "O período não pode terminar no passado ou antes do início." } as const
  if (endDate.getTime() - startDate.getTime() > 93 * 86_400_000) return { error: "O período personalizado pode ter no máximo 93 dias." } as const
  return { data: { periodType, startDate: startDate < today ? today : startDate, endDate, syncWithGoogle: body?.syncWithGoogle === true } } as const
}

export function parseStudyContent(value: unknown) {
  const body = value as { title?: unknown; description?: unknown; courseId?: unknown; dueDate?: unknown; importance?: unknown; estimatedMinutes?: unknown; studied?: unknown } | null
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const dueDate = typeof body?.dueDate === "string" && body.dueDate ? new Date(body.dueDate) : null
  const importance = Number(body?.importance), estimatedMinutes = Number(body?.estimatedMinutes)
  if (!title || title.length > 200) return { error: "Informe um título de até 200 caracteres." } as const
  if (dueDate && Number.isNaN(dueDate.getTime())) return { error: "Prazo inválido." } as const
  if (!Number.isInteger(importance) || importance < 1 || importance > 5) return { error: "A importância deve estar entre 1 e 5." } as const
  if (!Number.isInteger(estimatedMinutes) || estimatedMinutes < 15 || estimatedMinutes > 1200) return { error: "A duração estimada deve ficar entre 15 e 1200 minutos." } as const
  return { data: { title, description: typeof body?.description === "string" ? body.description.trim().slice(0, 5000) || null : null, courseId: typeof body?.courseId === "string" && body.courseId ? body.courseId : null, dueDate, importance, estimatedMinutes, studied: body?.studied === true } } as const
}
