import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { X1Game } from "@/components/x1/x1-game"
import { auth } from "@/lib/auth"
import { getPublicMatch, X1Error } from "@/lib/x1/service"

export default async function X1RoomPage({ params }: { params: Promise<{ roomCode: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const { roomCode } = await params
  let initialMatch
  try {
    initialMatch = await getPublicMatch(roomCode, session.user.id)
  } catch (error) {
    if (error instanceof X1Error && error.status === 404) notFound()
    throw error
  }
  return <main className="min-h-screen bg-[#F6F5F1] px-4 pb-12 pt-6 text-[#111] sm:px-8 sm:pt-8"><X1Game code={initialMatch.code} initialMatch={initialMatch} userId={session.user.id} /></main>
}
