import { codeBattleJsonError, getCodeBattleUserId } from "@/lib/code-battle/auth"
import { leaveRoom } from "@/lib/code-battle/service"

export async function POST(_request: Request, context: RouteContext<"/api/code-battle/rooms/[roomId]/leave">) {
  const userId = await getCodeBattleUserId()
  if (!userId) return Response.json({ error: "Nao autenticado." }, { status: 401 })
  try {
    const { roomId } = await context.params
    return Response.json({ room: await leaveRoom(roomId, userId) })
  } catch (error) {
    return codeBattleJsonError(error)
  }
}
