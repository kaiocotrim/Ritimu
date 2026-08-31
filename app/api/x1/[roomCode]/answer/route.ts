import { requireX1UserId } from "@/lib/x1/auth"
import { answerQuestion, x1ErrorResponse } from "@/lib/x1/service"

export async function POST(request: Request, context: RouteContext<"/api/x1/[roomCode]/answer">) {
  const userId = await requireX1UserId(); if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try { const body: unknown = await request.json(); const answer = body && typeof body === "object" && "answer" in body && typeof body.answer === "string" ? body.answer : ""; const { roomCode } = await context.params; return Response.json(await answerQuestion(roomCode, userId, answer)) } catch (error) { return x1ErrorResponse(error) }
}
