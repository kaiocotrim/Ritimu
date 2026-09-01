import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export async function getCodeBattleUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

export function codeBattleJsonError(error: unknown) {
  if (error instanceof CodeBattleError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  return Response.json({ error: "Nao foi possivel concluir a acao." }, { status: 500 })
}

export class CodeBattleError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}
