import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar/sidebar"
import { BattleResult } from "@/components/code-battle/battle-result"
import { auth } from "@/lib/auth"
import { CodeBattleError } from "@/lib/code-battle/auth"
import { getBattleResult } from "@/lib/code-battle/service"

export default async function CodeBattleResultPage(props: PageProps<"/code-battle/resultado/[battleId]">) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const { battleId } = await props.params
  let result: Awaited<ReturnType<typeof getBattleResult>>
  try {
    result = await getBattleResult(battleId, session.user.id)
  } catch (error) {
    if (error instanceof CodeBattleError && error.status === 404) notFound()
    throw error
  }
  return <main className="min-h-screen bg-[#080b10]"><BattleResult result={result} userId={session.user.id} /><Sidebar /></main>
}
