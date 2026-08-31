import { requireX1UserId } from "@/lib/x1/auth"
import { prisma } from "@/lib/prisma"
import { prepareRoomQuestions } from "@/lib/knowledge/prepare-room"
import { normalizeRoomCode } from "@/lib/x1/room-code"

export async function POST(_request: Request, context: { params: Promise<{ roomCode: string }> }) {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const { roomCode } = await context.params
  const match = await prisma.x1Match.findUnique({ where: { code: normalizeRoomCode(roomCode) }, select: { id: true, playerXId: true, playerOId: true } })
  if (!match || (match.playerXId !== userId && match.playerOId !== userId)) return Response.json({ error: "Sala não encontrada." }, { status: 404 })
  await prepareRoomQuestions(match.id)
  return Response.json({ success: true })
}
