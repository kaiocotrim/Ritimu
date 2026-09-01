import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar/sidebar"
import { CodeBattleHome } from "@/components/code-battle/code-battle-home"
import { auth } from "@/lib/auth"

export default async function JoinCodeBattlePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  return <main className="min-h-screen bg-[#F6F5F1] text-[#111111]"><CodeBattleHome mode="join" /><Sidebar /></main>
}
