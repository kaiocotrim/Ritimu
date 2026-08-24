import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    return Response.json({ error: "Não autenticado" }, { status: 401 })
  }

  const googleAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
    select: { id: true },
  })

  if (!googleAccount) {
    return Response.json(
      { error: "Google Classroom não conectado" },
      { status: 400 }
    )
  }

  let accessToken: string

  try {
    const token = await auth.api.getAccessToken({
      body: { accountId: googleAccount.id },
      headers: requestHeaders,
    })
    accessToken = token.accessToken
  } catch {
    return Response.json(
      {
        error: "Não foi possível renovar o acesso ao Google Classroom",
        code: "GOOGLE_REAUTH_REQUIRED",
      },
      { status: 401 }
    )
  }

  const response = await fetch("https://classroom.googleapis.com/v1/courses", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    return Response.json(data ?? { error: "Falha ao buscar turmas" }, {
      status: response.status,
    })
  }

  return Response.json(data)
}
