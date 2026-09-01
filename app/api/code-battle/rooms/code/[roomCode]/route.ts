import { codeBattleJsonError, getCodeBattleUserId } from "@/lib/code-battle/auth"
import { getRoomStateByCode } from "@/lib/code-battle/service"

export async function GET(_request: Request, context: RouteContext<"/api/code-battle/rooms/code/[roomCode]">) {
  const userId = await getCodeBattleUserId()
  if (!userId) return Response.json({ error: "Nao autenticado." }, { status: 401 })
  try {
    const { roomCode } = await context.params
    return Response.json({ room: await getRoomStateByCode(roomCode, userId) })
  } catch (error) {
    return codeBattleJsonError(error)
  }
}
