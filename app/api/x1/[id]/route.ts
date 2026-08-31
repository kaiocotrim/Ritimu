import { requireX1UserId } from "@/lib/x1/auth"
import { cancelDuel, errorResponse } from "@/lib/x1/service"

export async function DELETE(_request: Request, context: RouteContext<"/api/x1/[id]">) {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try {
    const { id } = await context.params
    await cancelDuel(id, userId)
    return Response.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
