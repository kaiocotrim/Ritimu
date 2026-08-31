import { requireX1UserId } from "@/lib/x1/auth"
import { createDuel, errorResponse, getDuelDashboard } from "@/lib/x1/service"

export async function GET() {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try {
    return Response.json(await getDuelDashboard(userId))
  } catch (error) {
    return errorResponse(error)
  }
}

export async function POST(request: Request) {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try {
    const body: unknown = await request.json()
    if (!body || typeof body !== "object") return Response.json({ error: "Dados inválidos." }, { status: 400 })
    const opponentId = "opponentId" in body && typeof body.opponentId === "string" ? body.opponentId : ""
    const durationHours = "durationHours" in body && typeof body.durationHours === "number" ? body.durationHours : 0
    const duel = await createDuel(userId, opponentId, durationHours)
    return Response.json({ id: duel.id }, { status: 201 })
  } catch (error) {
    return errorResponse(error)
  }
}
