export const DUEL_DURATIONS = [24, 72, 168] as const
export type DuelDuration = (typeof DUEL_DURATIONS)[number]
export type DuelOutcome = "WIN" | "LOSS" | "DRAW"

export class DuelRuleError extends Error {
  constructor(message: string, public readonly status = 409) {
    super(message)
    this.name = "DuelRuleError"
  }
}

export function isDuelDuration(value: number): value is DuelDuration {
  return DUEL_DURATIONS.some((duration) => duration === value)
}

export function validateChallenge(challengerId: string, opponentId: string, durationHours: number) {
  if (challengerId === opponentId) throw new DuelRuleError("Você não pode desafiar a si mesmo.", 400)
  if (!isDuelDuration(durationHours)) throw new DuelRuleError("Escolha uma duração válida.", 400)
}

export function assertCanRespond(input: { status: string; opponentId: string }, userId: string) {
  if (input.opponentId !== userId) throw new DuelRuleError("Somente o usuário desafiado pode responder.", 403)
  if (input.status !== "PENDING") throw new DuelRuleError("Este convite não está mais pendente.")
}

export function assertCanCancel(input: { status: string; challengerId: string }, userId: string) {
  if (input.challengerId !== userId) throw new DuelRuleError("Somente quem enviou o desafio pode cancelá-lo.", 403)
  if (input.status !== "PENDING") throw new DuelRuleError("Somente convites pendentes podem ser cancelados.")
}

export function earnedXp(currentXp: number, initialXp: number) {
  return Math.max(0, currentXp - initialXp)
}

export function outcomeFor(userScore: number, opponentScore: number): DuelOutcome {
  if (userScore === opponentScore) return "DRAW"
  return userScore > opponentScore ? "WIN" : "LOSS"
}

export function isExpired(endsAt: Date | null, now = new Date()) {
  return Boolean(endsAt && endsAt.getTime() <= now.getTime())
}
