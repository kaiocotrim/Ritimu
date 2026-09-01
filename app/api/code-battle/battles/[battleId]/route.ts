import { codeBattleJsonError, getCodeBattleUserId } from "@/lib/code-battle/auth"
import { advanceBattle, getBattleState } from "@/lib/code-battle/service"

export async function GET(_request: Request, context: RouteContext<"/api/code-battle/battles/[battleId]">) {
  const userId = await getCodeBattleUserId()
  if (!userId) return Response.json({ error: "Nao autenticado." }, { status: 401 })
  try {
    const { battleId } = await context.params
    await advanceBattle(battleId, userId)
    return Response.json(await getBattleState(battleId, userId))
  } catch (error) {
    return codeBattleJsonError(error)
  }
}
