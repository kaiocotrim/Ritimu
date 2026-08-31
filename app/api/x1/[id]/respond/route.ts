import { requireX1UserId } from "@/lib/x1/auth"
import { errorResponse, respondToDuel } from "@/lib/x1/service"

export async function PATCH(request: Request, context: RouteContext<"/api/x1/[id]/respond">) {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try {
    const body: unknown = await request.json()
    const action = body && typeof body === "object" && "action" in body ? body.action : null
    if (action !== "accept" && action !== "decline") return Response.json({ error: "Ação inválida." }, { status: 400 })
    const { id } = await context.params
    await respondToDuel(id, userId, action)
    return Response.json({ success: true })
  } catch (error) {
    return errorResponse(error)
  }
}
