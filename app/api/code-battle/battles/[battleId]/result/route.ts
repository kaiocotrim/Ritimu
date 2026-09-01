import { codeBattleJsonError, getCodeBattleUserId } from "@/lib/code-battle/auth"
import { getBattleResult } from "@/lib/code-battle/service"

export async function GET(_request: Request, context: RouteContext<"/api/code-battle/battles/[battleId]/result">) {
  const userId = await getCodeBattleUserId()
  if (!userId) return Response.json({ error: "Nao autenticado." }, { status: 401 })
  try {
    const { battleId } = await context.params
    return Response.json(await getBattleResult(battleId, userId))
  } catch (error) {
    return codeBattleJsonError(error)
  }
}
