import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar/sidebar"
import { BattlePlay } from "@/components/code-battle/battle-play"
import { auth } from "@/lib/auth"
import { CodeBattleError } from "@/lib/code-battle/auth"
import { getBattleState } from "@/lib/code-battle/service"

export default async function CodeBattlePlayPage(props: PageProps<"/code-battle/partida/[battleId]">) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const { battleId } = await props.params
  let state: Awaited<ReturnType<typeof getBattleState>>
  try {
    state = await getBattleState(battleId, session.user.id)
  } catch (error) {
    if (error instanceof CodeBattleError && error.status === 404) notFound()
    throw error
  }
  if (state.battle.status === "FINISHED") redirect(`/code-battle/resultado/${battleId}`)
  return <main className="min-h-screen bg-[#080b10]"><BattlePlay initialState={state} userId={session.user.id} /><Sidebar /></main>
}
