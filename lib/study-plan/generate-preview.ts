import { scheduleStudyPeriod } from "./schedule-sessions"
import type { AvailabilityWindow, StudyPlanPreview, StudyTask } from "./types"

function withReviews(tasks: StudyTask[], sessionMinutes: number) {
  const result = [...tasks]
  for (const task of tasks) {
    if (!task.dueAt || task.completed || (task.kind !== "EXAM" && task.importance < 5)) continue
    result.push({ ...task, id: `review:${task.id}`, title: `Revisão: ${task.title}`, kind: "REVIEW", estimatedMinutes: sessionMinutes, importance: Math.max(task.importance, 4) })
  }
  return result
}

export function generateStudyPlanPreview(input: { tasks: StudyTask[]; availability: AvailabilityWindow[]; startDate: Date; endDate: Date; now?: Date; sessionMinutes: number; breakMinutes: number; maxDailyMinutes: number }): StudyPlanPreview {
  const result = scheduleStudyPeriod({ ...input, tasks: withReviews(input.tasks, input.sessionMinutes) })
  const distribution: Record<string, number> = {}
  const activeDays = new Set(result.sessions.map((item) => item.scheduledStart.toISOString().slice(0, 10)))
  for (const session of result.sessions) distribution[session.subjectName] = (distribution[session.subjectName] ?? 0) + input.sessionMinutes
  const restDays: string[] = []
  for (const day = new Date(input.startDate); day <= input.endDate; day.setDate(day.getDate() + 1)) {
    const key = day.toISOString().slice(0, 10)
    if (!activeDays.has(key)) restDays.push(key)
  }
  return { sessions: result.sessions, unscheduled: result.unscheduled, totalMinutes: result.sessions.length * input.sessionMinutes, distribution, restDays }
}
