export type DayCompletionStatus = "PERFECT" | "PARTIAL" | "MISSED" | "NEUTRAL"

type DayActivity = { status: "PENDING" | "COMPLETED" | "CANCELED" }

const localDayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

export function getDayCompletionStatus(date: Date, activities: DayActivity[], now = new Date()): DayCompletionStatus {
  const relevant = activities.filter((activity) => activity.status !== "CANCELED")
  if (!relevant.length) return "NEUTRAL"

  const completed = relevant.filter((activity) => activity.status === "COMPLETED").length
  if (completed === relevant.length) return "PERFECT"

  const isPast = date.getTime() < now.getTime() && localDayKey(date) !== localDayKey(now)
  if (!isPast) return "NEUTRAL"
  return completed > 0 ? "PARTIAL" : "MISSED"
}
