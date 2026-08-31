import { requireX1UserId } from "@/lib/x1/auth"
import { createRoom, x1ErrorResponse } from "@/lib/x1/service"

export async function POST() {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try { return Response.json(await createRoom(userId), { status: 201 }) } catch (error) { return x1ErrorResponse(error) }
}
