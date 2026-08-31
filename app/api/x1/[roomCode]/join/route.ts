import { requireX1UserId } from "@/lib/x1/auth"
import { joinRoom, x1ErrorResponse } from "@/lib/x1/service"

export async function POST(_request: Request, context: RouteContext<"/api/x1/[roomCode]/join">) {
  const userId = await requireX1UserId(); if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try { const { roomCode } = await context.params; return Response.json(await joinRoom(roomCode, userId)) } catch (error) { return x1ErrorResponse(error) }
}
