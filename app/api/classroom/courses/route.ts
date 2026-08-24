import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const requestHeaders = await headers()

  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  if (!session) {
    return Response.json(
      { error: "Não autenticado" },
      { status: 401 }
    )
  }

  const googleAccount = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "google",
    },
  })

  if (!googleAccount) {
    return Response.json(
      { error: "Google Classroom não conectado" },
      { status: 400 }
    )
  }

  const { accessToken } = await auth.api.getAccessToken({
    body: {
      accountId: googleAccount.id,
    },
    headers: requestHeaders,
  })

  const response = await fetch(
    "https://classroom.googleapis.com/v1/courses",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return Response.json(data, {
      status: response.status,
    })
  }

  return Response.json(data)
}