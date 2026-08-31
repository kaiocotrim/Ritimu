import { requireX1UserId } from "@/lib/x1/auth"
import { chooseSubject, x1ErrorResponse } from "@/lib/x1/service"

export async function PATCH(request: Request, context: RouteContext<"/api/x1/[roomCode]/subject">) {
  const userId = await requireX1UserId(); if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try { const body: unknown = await request.json(); const subject = body && typeof body === "object" && "subject" in body && typeof body.subject === "string" ? body.subject : ""; const { roomCode } = await context.params; await chooseSubject(roomCode, userId, subject); return Response.json({ success: true }) } catch (error) { return x1ErrorResponse(error) }
}
