import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { characters } from "@/lib/characters"
import { claimRoadmapCharacterReward } from "@/lib/characters/service"

export async function GET(_request: Request, { params }: { params: Promise<{ roadmapId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const { roadmapId } = await params
  const [enrollment, reward] = await Promise.all([
    prisma.roadmapEnrollment.findUnique({ where: { userId_roadmapId: { userId: session.user.id, roadmapId } }, select: { completedAt: true } }),
    prisma.roadmapCharacterReward.findUnique({ where: { userId_roadmapId: { userId: session.user.id, roadmapId } } }),
  ])
  return Response.json({ eligible: Boolean(enrollment?.completedAt), character: reward ? characters.find((item) => item.id === reward.characterId) ?? null : null })
}

export async function POST(_request: Request, { params }: { params: Promise<{ roadmapId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const { roadmapId } = await params
  try {
    return Response.json(await claimRoadmapCharacterReward(session.user.id, roadmapId))
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Não foi possível resgatar a recompensa." }, { status: 422 })
  }
}
