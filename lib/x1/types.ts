export type DuelUser = { id: string; name: string; image: string | null }

export type DuelView = {
  id: string
  status: "PENDING" | "ACTIVE" | "DECLINED" | "CANCELED" | "COMPLETED"
  durationHours: number
  startsAt: string | null
  endsAt: string | null
  completedAt: string | null
  createdAt: string
  challenger: DuelUser
  opponent: DuelUser
  challengerScore: number
  opponentScore: number
  outcome: "WIN" | "LOSS" | "DRAW" | null
}

export type DuelDashboard = {
  currentUserId: string
  active: DuelView[]
  received: DuelView[]
  sent: DuelView[]
  history: DuelView[]
  summary: { wins: number; losses: number; draws: number; active: number }
}
