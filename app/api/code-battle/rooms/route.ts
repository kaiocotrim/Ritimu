import { codeBattleJsonError, getCodeBattleUserId } from "@/lib/code-battle/auth"
import { createCodeBattleRoom, getUserBattleHistory, joinCodeBattleRoom } from "@/lib/code-battle/service"

export async function GET() {
  const userId = await getCodeBattleUserId()
  if (!userId) return Response.json({ error: "Nao autenticado." }, { status: 401 })
  return Response.json({ history: await getUserBattleHistory(userId) })
}

export async function POST(request: Request) {
  const userId = await getCodeBattleUserId()
  if (!userId) return Response.json({ error: "Nao autenticado." }, { status: 401 })
  try {
    const body = await request.json().catch(() => null)
    const room = typeof body?.code === "string" ? await joinCodeBattleRoom(body.code, userId) : await createCodeBattleRoom(userId, body ?? {})
    return Response.json({ room }, { status: typeof body?.code === "string" ? 200 : 201 })
  } catch (error) {
    return codeBattleJsonError(error)
  }
}
