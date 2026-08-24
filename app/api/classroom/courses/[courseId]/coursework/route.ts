import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = {
  params: Promise<{ courseId: string }>
}

export async function GET(_request: Request, { params }: RouteParams) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    return Response.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { courseId } = await params
  const [googleAccount, course] = await Promise.all([
    prisma.account.findFirst({
      where: {
        userId: session.user.id,
        providerId: "google",
      },
      select: { id: true },
    }),
    prisma.classroomCourse.findFirst({
      where: { userId: session.user.id, googleCourseId: courseId },
      select: { id: true },
    }),
  ])

  if (!googleAccount) {
    return Response.json(
      { error: "Google Classroom não conectado" },
      { status: 400 }
    )
  }

  if (!course) {
    return Response.json(
      { error: "Disciplina não encontrada" },
      { status: 404 }
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
        action: "Reconecte a conta Google Classroom.",
      },
      { status: 401 }
    )
  }

  if (!accessToken) {
    return Response.json(
      {
        error: "Token de acesso do Google indisponível",
        code: "GOOGLE_REAUTH_REQUIRED",
        action: "Reconecte a conta Google Classroom.",
      },
      { status: 401 }
    )
  }

  const response = await fetch(
    `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWork`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  )

  if (response.ok) {
    return Response.json(await response.json())
  }

  const googleError = await response.json().catch(() => null)

  if (response.status === 401) {
    return Response.json(
      {
        error: "O Google recusou o token de acesso",
        code: "GOOGLE_REAUTH_REQUIRED",
        action: "Reconecte a conta Google Classroom.",
      },
      { status: 401 }
    )
  }

  if (response.status === 403) {
    return Response.json(
      {
        error: "Sem permissão para acessar as atividades desta turma",
        code: "CLASSROOM_FORBIDDEN",
        details: googleError?.error?.message,
        action: "Reconecte a conta Google Classroom e conceda acesso às atividades.",
      },
      { status: 403 }
    )
  }

  return Response.json(
    {
      error: "Falha ao buscar atividades no Google Classroom",
      details: googleError?.error?.message,
    },
    { status: response.status }
  )
}
