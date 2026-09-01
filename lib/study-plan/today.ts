import { prisma } from "@/lib/prisma"

const DAY_IN_MS = 86_400_000

export function getDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function getDayRange(date = new Date()) {
  const start = new Date(`${getDateKey(date)}T00:00:00-03:00`)
  return { start, end: new Date(start.getTime() + DAY_IN_MS) }
}

export const getTodayRange = getDayRange

function weekday(date: Date) {
  const value = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
  }).format(date)
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(value)
}

export async function getCalendarEventsForDay(userId: string, date = new Date()) {
  const { start, end } = getDayRange(date)
  const events = await prisma.calendarEvent.findMany({
    where: {
      userId,
      status: { not: "CANCELED" },
      startAt: { lt: end },
      OR: [
        { startAt: { gte: start } },
        {
          recurrence: { not: "NONE" },
          OR: [{ recurrenceUntil: null }, { recurrenceUntil: { gte: start } }],
        },
      ],
    },
    orderBy: { startAt: "asc" },
    include: {
      studySession: { select: { subjectName: true } },
      dayCompletions: {
        where: { occurrenceDate: start },
        select: { id: true },
      },
    },
  })
  const targetWeekday = weekday(start)

  return events
    .filter((event) => {
      if (event.recurrence === "NONE") return event.startAt >= start
      if (event.recurrence === "WEEKLY") return weekday(event.startAt) === targetWeekday
      return event.recurrenceDays.includes(targetWeekday)
    })
    .map((event) => ({
      ...event,
      occurrenceCompleted: event.dayCompletions.length > 0,
    }))
}

export const getTodayCalendarEvents = getCalendarEventsForDay

export async function getTodayStudyProgress(userId: string) {
  const events = await getTodayCalendarEvents(userId)
  const total = events.length
  const completed = events.filter((event) => event.occurrenceCompleted).length

  return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
}

export async function getWeekScheduleSummary(userId: string, now = new Date()) {
  const { start: today } = getDayRange(now)
  const weekStart = new Date(today.getTime() - weekday(today) * DAY_IN_MS)
  const days = await Promise.all(
    Array.from({ length: 7 }, (_, index) =>
      getCalendarEventsForDay(userId, new Date(weekStart.getTime() + index * DAY_IN_MS)),
    ),
  )
  const weekActivity = days.map((events) => events.some((event) => event.occurrenceCompleted))
  const todayIndex = weekday(today)
  let cursor = weekActivity[todayIndex] ? todayIndex : todayIndex - 1
  let streak = 0

  while (cursor >= 0 && weekActivity[cursor]) {
    streak += 1
    cursor -= 1
  }

  if (cursor < 0) {
    let previousDay = new Date(weekStart.getTime() - DAY_IN_MS)
    for (let checkedDays = 0; checkedDays < 365; checkedDays += 1) {
      const events = await getCalendarEventsForDay(userId, previousDay)
      if (!events.some((event) => event.occurrenceCompleted)) break
      streak += 1
      previousDay = new Date(previousDay.getTime() - DAY_IN_MS)
    }
  }

  return { weekActivity, streak }
}
