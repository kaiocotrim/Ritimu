import { requireX1UserId } from "@/lib/x1/auth"
import { selectCell, x1ErrorResponse } from "@/lib/x1/service"

export async function POST(request: Request, context: RouteContext<"/api/x1/[roomCode]/cell">) {
  const userId = await requireX1UserId(); if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try { const body: unknown = await request.json(); const cell = body && typeof body === "object" && "cell" in body && typeof body.cell === "number" ? body.cell : -1; const { roomCode } = await context.params; await selectCell(roomCode, userId, cell); return Response.json({ success: true }) } catch (error) { return x1ErrorResponse(error) }
}
