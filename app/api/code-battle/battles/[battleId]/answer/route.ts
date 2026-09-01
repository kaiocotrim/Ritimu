import { codeBattleJsonError, getCodeBattleUserId } from "@/lib/code-battle/auth"
import { answerQuestion } from "@/lib/code-battle/service"

export async function POST(request: Request, context: RouteContext<"/api/code-battle/battles/[battleId]/answer">) {
  const userId = await getCodeBattleUserId()
  if (!userId) return Response.json({ error: "Nao autenticado." }, { status: 401 })
  try {
    const { battleId } = await context.params
    const body = await request.json().catch(() => null)
    return Response.json({ result: await answerQuestion(battleId, userId, { questionId: body?.questionId, selectedOption: body?.selectedOption }) })
  } catch (error) {
    return codeBattleJsonError(error)
  }
}
