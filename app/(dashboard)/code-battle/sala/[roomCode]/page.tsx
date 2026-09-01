import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar/sidebar"
import { WaitingRoom } from "@/components/code-battle/waiting-room"
import { auth } from "@/lib/auth"
import { CodeBattleError } from "@/lib/code-battle/auth"
import { getRoomStateByCode, joinCodeBattleRoom } from "@/lib/code-battle/service"

export default async function CodeBattleRoomPage(props: PageProps<"/code-battle/sala/[roomCode]">) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const { roomCode } = await props.params
  let room: Awaited<ReturnType<typeof getRoomStateByCode>>
  try {
    await joinCodeBattleRoom(roomCode, session.user.id)
    room = await getRoomStateByCode(roomCode, session.user.id)
  } catch (error) {
    if (error instanceof CodeBattleError && error.status === 404) notFound()
    throw error
  }
  if (room.battle?.id && room.status === "PLAYING") redirect(`/code-battle/partida/${room.battle.id}`)
  return <main className="min-h-screen bg-[#F6F5F1] text-[#111111]"><WaitingRoom initialRoom={room} userId={session.user.id} /><Sidebar /></main>
}
