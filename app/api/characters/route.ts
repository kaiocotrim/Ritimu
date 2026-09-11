import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getUnlockedCharacterIds } from "@/lib/characters/service"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado." }, { status: 401 })
  return Response.json({ unlockedIds: await getUnlockedCharacterIds(session.user.id) })
}
