import { codeBattleJsonError, getCodeBattleUserId } from "@/lib/code-battle/auth"
import { setReady } from "@/lib/code-battle/service"

export async function POST(request: Request, context: RouteContext<"/api/code-battle/rooms/[roomId]/ready">) {
  const userId = await getCodeBattleUserId()
  if (!userId) return Response.json({ error: "Nao autenticado." }, { status: 401 })
  try {
    const { roomId } = await context.params
    const body = await request.json().catch(() => null)
    await setReady(roomId, userId, Boolean(body?.ready))
    return Response.json({ ok: true })
  } catch (error) {
    return codeBattleJsonError(error)
  }
}
