import { calculatePriority } from "./calculate-priority"
import type { AvailabilityWindow, PlannedSession, StudyTask } from "./types"

function atTime(day: Date, value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  const result = new Date(day)
  result.setHours(hours, minutes, 0, 0)
  return result
}

export function scheduleSessions(input: { tasks: StudyTask[]; availability: AvailabilityWindow[]; startDate: Date; days?: number; sessionMinutes: number; breakMinutes: number; maxDailyMinutes: number }) {
  return scheduleStudyPeriod(input).sessions
}

export function scheduleStudyPeriod(input: { tasks: StudyTask[]; availability: AvailabilityWindow[]; startDate: Date; endDate?: Date; days?: number; now?: Date; sessionMinutes: number; breakMinutes: number; maxDailyMinutes: number }) {
  const ranked = input.tasks.map((task) => ({ ...task, ...calculatePriority(task, input.startDate) })).filter((task) => task.score >= 0).sort((a, b) => Number(Boolean(b.dueAt)) - Number(Boolean(a.dueAt)) || b.score - a.score)
  const queue = [...ranked]
  const sessions: PlannedSession[] = []
  const now = input.now ?? input.startDate
  const endDate = input.endDate ?? new Date(input.startDate.getTime() + ((input.days ?? 7) - 1) * 86_400_000)
  const totalDays = Math.max(1, Math.floor((endDate.getTime() - input.startDate.getTime()) / 86_400_000) + 1)
  for (let offset = 0; offset < totalDays && queue.length; offset++) {
    const day = new Date(input.startDate); day.setDate(day.getDate() + offset)
    const window = input.availability.find((item) => item.weekday === day.getDay())
    if (!window) continue
    let cursor = atTime(day, window.startTime), used = 0
    const end = atTime(day, window.endTime)
    while (cursor <= now) cursor = new Date(cursor.getTime() + (input.sessionMinutes + input.breakMinutes) * 60_000)
    let previousSubject: string | null | undefined
    while (queue.length && used + input.sessionMinutes <= input.maxDailyMinutes && cursor.getTime() + input.sessionMinutes * 60_000 <= end.getTime()) {
      let index = queue.findIndex((task) => task.subjectId !== previousSubject)
      if (index < 0) index = 0
      const task = queue.splice(index, 1)[0]
      const scheduledEnd = new Date(cursor.getTime() + input.sessionMinutes * 60_000)
      sessions.push({ ...task, priorityScore: task.score, priorityReason: task.reason, scheduledStart: cursor, scheduledEnd })
      previousSubject = task.subjectId
      used += input.sessionMinutes
      cursor = new Date(scheduledEnd.getTime() + input.breakMinutes * 60_000)
      const remaining = task.estimatedMinutes - input.sessionMinutes
      if (remaining > 0) queue.push({ ...task, estimatedMinutes: remaining })
      queue.sort((a, b) => b.score - a.score)
    }
  }
  return { sessions, unscheduled: queue.map((item) => {
    const { score, reason, ...task } = item
    void score
    void reason
    return task
  }) }
}
