import { requireX1UserId } from "@/lib/x1/auth"
import { getPublicMatch, x1ErrorResponse } from "@/lib/x1/service"

export async function GET(_request: Request, context: RouteContext<"/api/x1/[roomCode]">) {
  const userId = await requireX1UserId(); if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try { const { roomCode } = await context.params; return Response.json({ match: await getPublicMatch(roomCode, userId), userId }) } catch (error) { return x1ErrorResponse(error) }
}
