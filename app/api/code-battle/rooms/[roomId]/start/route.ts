import { codeBattleJsonError, getCodeBattleUserId } from "@/lib/code-battle/auth"
import { startBattle } from "@/lib/code-battle/service"

export async function POST(_request: Request, context: RouteContext<"/api/code-battle/rooms/[roomId]/start">) {
  const userId = await getCodeBattleUserId()
  if (!userId) return Response.json({ error: "Nao autenticado." }, { status: 401 })
  try {
    const { roomId } = await context.params
    return Response.json({ battle: await startBattle(roomId, userId) })
  } catch (error) {
    return codeBattleJsonError(error)
  }
}
