import type { Prisma } from "@/lib/generated/prisma/client"
import { XpSource } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"
import { getWeekScheduleSummary } from "@/lib/study-plan/today"

export const XP_REWARDS = {
  classroomItem: 25,
  studySession: 25,
  studyContent: 25,
} as const

const DAY_IN_MS = 86_400_000
const DAILY_GOAL_XP = 100

type XpWriter = Pick<Prisma.TransactionClient, "xpTransaction">

export async function awardXp(
  tx: XpWriter,
  input: {
    userId: string
    amount: number
    source: XpSource
    referenceId: string
    description: string
    earnedAt?: Date
  },
) {
  return tx.xpTransaction.upsert({
    where: {
      userId_source_referenceId: {
        userId: input.userId,
        source: input.source,
        referenceId: input.referenceId,
      },
    },
    update: {},
    create: input,
  })
}

function dayKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

function shiftDay(date: Date, amount: number) {
  return new Date(date.getTime() + amount * DAY_IN_MS)
}

export function calculateStreak(dates: Date[], now = new Date()) {
  const activeDays = new Set(dates.map(dayKey))
  let cursor = activeDays.has(dayKey(now)) ? now : shiftDay(now, -1)
  let streak = 0

  while (activeDays.has(dayKey(cursor))) {
    streak += 1
    cursor = shiftDay(cursor, -1)
  }

  return streak
}

export function getLevelProgress(totalXp: number) {
  const level = Math.floor(totalXp / 250) + 1
  const currentLevelXp = (level - 1) * 250
  const nextLevelXp = level * 250
  const progress = Math.round(((totalXp - currentLevelXp) / 250) * 100)

  return { level, nextLevelXp, progress }
}

export async function getGamificationSummary(userId: string) {
  const [transactions, schedule] = await Promise.all([
    prisma.xpTransaction.findMany({
      where: { userId },
      select: { amount: true, earnedAt: true },
    }),
    getWeekScheduleSummary(userId),
  ])
  const today = dayKey(new Date())
  const totalXp = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const todayXp = transactions
    .filter((transaction) => dayKey(transaction.earnedAt) === today)
    .reduce((sum, transaction) => sum + transaction.amount, 0)

  return {
    totalXp,
    todayXp,
    dailyGoalXp: DAILY_GOAL_XP,
    dailyGoalPercent: Math.min(100, Math.round((todayXp / DAILY_GOAL_XP) * 100)),
    streak: schedule.streak,
    weekActivity: schedule.weekActivity,
    ...getLevelProgress(totalXp),
  }
}

export { XpSource }
