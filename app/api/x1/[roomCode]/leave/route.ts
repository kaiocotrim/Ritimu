import { requireX1UserId } from "@/lib/x1/auth"
import { leaveRoom, x1ErrorResponse } from "@/lib/x1/service"

export async function POST(_request: Request, context: RouteContext<"/api/x1/[roomCode]/leave">) {
  const userId = await requireX1UserId(); if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try { const { roomCode } = await context.params; await leaveRoom(roomCode, userId); return Response.json({ success: true }) } catch (error) { return x1ErrorResponse(error) }
}
