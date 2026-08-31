import { requireX1UserId } from "@/lib/x1/auth"
import { errorResponse, getDuelScore } from "@/lib/x1/service"

export async function GET(_request: Request, context: RouteContext<"/api/x1/[id]/score">) {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try {
    const { id } = await context.params
    return Response.json({ duel: await getDuelScore(id, userId) })
  } catch (error) {
    return errorResponse(error)
  }
}
