import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(_request: Request, { params }: { params: Promise<{ roadmapId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const { roadmapId } = await params
  const roadmap = await prisma.studyRoadmap.findFirst({ where: { id: roadmapId, OR: [{ isPublic: true }, { creatorId: session.user.id }] }, select: { id: true } })
  if (!roadmap) return Response.json({ error: "Roadmap não encontrado." }, { status: 404 })
  await prisma.roadmapEnrollment.upsert({ where: { userId_roadmapId: { userId: session.user.id, roadmapId } }, update: {}, create: { userId: session.user.id, roadmapId } })
  return Response.json({ ok: true })
}
