import "server-only"

import type { Prisma } from "@/lib/generated/prisma/client"
import { Prisma as PrismaNamespace } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { assertCanCancel, assertCanRespond, DuelRuleError, outcomeFor, validateChallenge } from "./domain"
import type { DuelDashboard, DuelView } from "./types"

const personSelect = { id: true, name: true, image: true } as const
type DuelWithPeople = Prisma.DuelGetPayload<{ include: { challenger: { select: typeof personSelect }; opponent: { select: typeof personSelect } } }>

async function totalXp(tx: Pick<Prisma.TransactionClient, "xpTransaction">, userId: string, until: Date) {
  const result = await tx.xpTransaction.aggregate({
    where: { userId, earnedAt: { lte: until } },
    _sum: { amount: true },
  })
  return result._sum.amount ?? 0
}

async function finalizeDuel(id: string, now: Date) {
  return prisma.$transaction(async (tx) => {
    const duel = await tx.duel.findUnique({ where: { id } })
    if (!duel || duel.status !== "ACTIVE" || !duel.endsAt || duel.endsAt > now) return
    const cutoff = duel.endsAt
    const [challengerFinalXp, opponentFinalXp] = await Promise.all([
      totalXp(tx, duel.challengerId, cutoff),
      totalXp(tx, duel.opponentId, cutoff),
    ])
    await tx.duel.updateMany({
      where: { id, status: "ACTIVE", endsAt: { lte: now } },
      data: { status: "COMPLETED", completedAt: now, challengerFinalXp, opponentFinalXp },
    })
  }, { isolationLevel: "Serializable" })
}

export async function finalizeExpiredDuels(userId: string, now = new Date()) {
  const expired = await prisma.duel.findMany({
    where: { status: "ACTIVE", endsAt: { lte: now }, OR: [{ challengerId: userId }, { opponentId: userId }] },
    select: { id: true },
  })
  for (const duel of expired) await finalizeDuel(duel.id, now)
}

async function toView(duel: DuelWithPeople, userId: string, now: Date): Promise<DuelView> {
  let challengerCurrent = duel.challengerFinalXp
  let opponentCurrent = duel.opponentFinalXp
  if (duel.status === "ACTIVE" && duel.startsAt && duel.endsAt) {
    const cutoff = now < duel.endsAt ? now : duel.endsAt
    ;[challengerCurrent, opponentCurrent] = await Promise.all([
      totalXp(prisma, duel.challengerId, cutoff),
      totalXp(prisma, duel.opponentId, cutoff),
    ])
  }
  const challengerScore = duel.challengerInitialXp == null || challengerCurrent == null ? 0 : Math.max(0, challengerCurrent - duel.challengerInitialXp)
  const opponentScore = duel.opponentInitialXp == null || opponentCurrent == null ? 0 : Math.max(0, opponentCurrent - duel.opponentInitialXp)
  const mine = duel.challengerId === userId ? challengerScore : opponentScore
  const theirs = duel.challengerId === userId ? opponentScore : challengerScore
  return {
    id: duel.id,
    status: duel.status,
    durationHours: duel.durationHours,
    startsAt: duel.startsAt?.toISOString() ?? null,
    endsAt: duel.endsAt?.toISOString() ?? null,
    completedAt: duel.completedAt?.toISOString() ?? null,
    createdAt: duel.createdAt.toISOString(),
    challenger: duel.challenger,
    opponent: duel.opponent,
    challengerScore,
    opponentScore,
    outcome: duel.status === "COMPLETED" ? outcomeFor(mine, theirs) : null,
  }
}

export async function getDuelDashboard(userId: string): Promise<DuelDashboard> {
  const now = new Date()
  await finalizeExpiredDuels(userId, now)
  const duels = await prisma.duel.findMany({
    where: { OR: [{ challengerId: userId }, { opponentId: userId }] },
    include: { challenger: { select: personSelect }, opponent: { select: personSelect } },
    orderBy: { createdAt: "desc" },
    take: 100,
  })
  const views = await Promise.all(duels.map((duel) => toView(duel, userId, now)))
  const history = views.filter((duel) => duel.status === "COMPLETED")
  return {
    currentUserId: userId,
    active: views.filter((duel) => duel.status === "ACTIVE"),
    received: views.filter((duel) => duel.status === "PENDING" && duel.opponent.id === userId),
    sent: views.filter((duel) => duel.challenger.id === userId && duel.status !== "ACTIVE" && duel.status !== "COMPLETED"),
    history,
    summary: {
      wins: history.filter((duel) => duel.outcome === "WIN").length,
      losses: history.filter((duel) => duel.outcome === "LOSS").length,
      draws: history.filter((duel) => duel.outcome === "DRAW").length,
      active: views.filter((duel) => duel.status === "ACTIVE").length,
    },
  }
}

export async function createDuel(challengerId: string, opponentId: string, durationHours: number) {
  validateChallenge(challengerId, opponentId, durationHours)
  try {
    return await prisma.$transaction(async (tx) => {
      const opponent = await tx.user.findUnique({ where: { id: opponentId }, select: { id: true } })
      if (!opponent) throw new DuelRuleError("Oponente não encontrado.", 404)
      const existing = await tx.duel.findFirst({
        where: { status: "PENDING", OR: [{ challengerId, opponentId }, { challengerId: opponentId, opponentId: challengerId }] },
      })
      if (existing) throw new DuelRuleError("Já existe um convite pendente entre vocês.")
      return tx.duel.create({ data: { challengerId, opponentId, durationHours } })
    }, { isolationLevel: "Serializable" })
  } catch (error) {
    if (error instanceof DuelRuleError) throw error
    if (error instanceof PrismaNamespace.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new DuelRuleError("Já existe um convite pendente entre vocês.")
    }
    throw error
  }
}

export async function respondToDuel(id: string, userId: string, action: "accept" | "decline", now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const duel = await tx.duel.findUnique({ where: { id } })
    if (!duel) throw new DuelRuleError("Desafio não encontrado.", 404)
    assertCanRespond(duel, userId)
    if (action === "decline") {
      const changed = await tx.duel.updateMany({ where: { id, status: "PENDING", opponentId: userId }, data: { status: "DECLINED" } })
      if (changed.count !== 1) throw new DuelRuleError("Este convite já foi respondido.")
      return
    }
    const endsAt = new Date(now.getTime() + duel.durationHours * 3_600_000)
    const [challengerInitialXp, opponentInitialXp] = await Promise.all([
      totalXp(tx, duel.challengerId, now),
      totalXp(tx, duel.opponentId, now),
    ])
    const changed = await tx.duel.updateMany({
      where: { id, status: "PENDING", opponentId: userId },
      data: { status: "ACTIVE", startsAt: now, endsAt, challengerInitialXp, opponentInitialXp },
    })
    if (changed.count !== 1) throw new DuelRuleError("Este convite já foi respondido.")
  }, { isolationLevel: "Serializable" })
}

export async function cancelDuel(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const duel = await tx.duel.findUnique({ where: { id } })
    if (!duel) throw new DuelRuleError("Desafio não encontrado.", 404)
    assertCanCancel(duel, userId)
    const changed = await tx.duel.updateMany({ where: { id, status: "PENDING", challengerId: userId }, data: { status: "CANCELED" } })
    if (changed.count !== 1) throw new DuelRuleError("Este convite não pode mais ser cancelado.")
  }, { isolationLevel: "Serializable" })
}

export async function getDuelScore(id: string, userId: string) {
  await finalizeExpiredDuels(userId)
  const duel = await prisma.duel.findFirst({
    where: { id, OR: [{ challengerId: userId }, { opponentId: userId }] },
    include: { challenger: { select: personSelect }, opponent: { select: personSelect } },
  })
  if (!duel) throw new DuelRuleError("Desafio não encontrado.", 404)
  return toView(duel, userId, new Date())
}

export function errorResponse(error: unknown) {
  if (error instanceof DuelRuleError) return Response.json({ error: error.message }, { status: error.status })
  console.error(error)
  return Response.json({ error: "Não foi possível concluir a operação." }, { status: 500 })
}
