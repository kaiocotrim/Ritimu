import { prisma } from "@/lib/prisma"
import { XpSource } from "@/lib/generated/prisma/enums"
import { getDateKey, getDayRange, getTodayCalendarEvents, getWeekScheduleSummary } from "@/lib/study-plan/today"

const DAY_IN_MS = 86_400_000

export type MissionProgress = {
  current: number
  target: number
  progress: number
  completed: boolean
}

function mission(current: number, target: number): MissionProgress {
  return {
    current,
    target,
    progress: Math.min(100, Math.round((current / target) * 100)),
    completed: current >= target,
  }
}

export async function getMissionProgress(userId: string) {
  const { start: todayStart, end: todayEnd } = getDayRange()
  const weekStart = new Date(todayStart.getTime() - todayStart.getUTCDay() * DAY_IN_MS)
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY_IN_MS)

  const [todayChecks, weekChecks, todayClassroom, weekClassroom, todayEvents, schedule] = await Promise.all([
    prisma.calendarEventDayCompletion.findMany({
      where: { userId, occurrenceDate: { gte: todayStart, lt: todayEnd } },
      select: {
        calendarEvent: {
          select: {
            type: true,
            startAt: true,
            endAt: true,
            studySession: { select: { courseId: true } },
          },
        },
      },
    }),
    prisma.calendarEventDayCompletion.findMany({
      where: { userId, occurrenceDate: { gte: weekStart, lt: weekEnd } },
      select: {
        calendarEvent: {
          select: { studySession: { select: { courseId: true } } },
        },
      },
    }),
    prisma.classroomItemCompletion.findMany({
      where: { userId, completed: true, updatedAt: { gte: todayStart, lt: todayEnd } },
      select: { courseId: true },
    }),
    prisma.classroomItemCompletion.findMany({
      where: { userId, completed: true, updatedAt: { gte: weekStart, lt: weekEnd } },
      select: { courseId: true },
    }),
    getTodayCalendarEvents(userId),
    getWeekScheduleSummary(userId),
  ])

  const completedToday = todayChecks.length + todayClassroom.length
  const studiedMinutesToday = todayChecks.reduce((minutes, check) => {
    const event = check.calendarEvent
    if (event.type !== "STUDY" || !event.endAt) return minutes
    return minutes + Math.max(0, Math.round((event.endAt.getTime() - event.startAt.getTime()) / 60_000))
  }, 0)
  const completedWeek = weekChecks.length + weekClassroom.length
  const courseIds = new Set([
    ...weekClassroom.map((item) => item.courseId),
    ...weekChecks.map((item) => item.calendarEvent.studySession?.courseId).filter((id): id is string => Boolean(id)),
  ])
  const perfectToday = todayEvents.length > 0 && todayEvents.every((event) => event.occurrenceCompleted) ? 1 : 0

  return {
    "1": mission(completedToday, 1),
    "2": mission(studiedMinutesToday, 30),
    "3": mission(perfectToday, 1),
    "4": mission(completedWeek, 5),
    "5": mission(courseIds.size, 3),
    "6": mission(schedule.streak, 7),
  }
}

const missionRewards = {
  "1": { amount: 20, description: "Missão: Complete 1 atividade", period: "daily" },
  "2": { amount: 15, description: "Missão: Estude por 30 minutos", period: "daily" },
  "3": { amount: 10, description: "Missão: Mantenha a sequência", period: "daily" },
  "4": { amount: 80, description: "Missão: Finalize 5 atividades", period: "weekly" },
  "5": { amount: 60, description: "Missão: Explore 3 matérias", period: "weekly" },
  "6": { amount: 100, description: "Missão: Sequência de 7 dias", period: "weekly" },
} as const

export async function syncMissionRewards(
  userId: string,
  progress: Awaited<ReturnType<typeof getMissionProgress>>,
) {
  const { start: todayStart } = getDayRange()
  const weekStart = new Date(todayStart.getTime() - todayStart.getUTCDay() * DAY_IN_MS)
  const completedMissions = Object.entries(missionRewards).filter(([id]) => progress[id as keyof typeof progress].completed)
  if (completedMissions.length === 0) return

  await prisma.$transaction(
    completedMissions.map(([id, reward]) => {
      const periodKey = reward.period === "daily" ? getDateKey(todayStart) : getDateKey(weekStart)
      return prisma.xpTransaction.upsert({
        where: {
          userId_source_referenceId: {
            userId,
            source: XpSource.MISSION,
            referenceId: `${id}:${periodKey}`,
          },
        },
        update: {},
        create: {
          userId,
          amount: reward.amount,
          source: XpSource.MISSION,
          referenceId: `${id}:${periodKey}`,
          description: reward.description,
        },
      })
    }),
  )
}
