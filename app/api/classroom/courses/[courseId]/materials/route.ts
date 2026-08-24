import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import type {
  GoogleClassroomCourseWorkMaterial,
  GoogleClassroomCourseWorkMaterialsResponse,
} from "@/lib/google-classroom"
import { prisma } from "@/lib/prisma"

type RouteParams = {
  params: Promise<{ courseId: string }>
}

type GoogleErrorResponse = {
  error?: { message?: string }
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
      where: { userId: session.user.id, providerId: "google" },
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

  const materials: GoogleClassroomCourseWorkMaterial[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(
      `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWorkMaterials`
    )
    url.searchParams.set("pageSize", "100")
    if (pageToken) url.searchParams.set("pageToken", pageToken)

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    const data = (await response.json().catch(() => null)) as
      | (GoogleClassroomCourseWorkMaterialsResponse & GoogleErrorResponse)
      | null

    if (!response.ok) {
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
            error: "Sem permissão para acessar os materiais desta turma",
            code: "CLASSROOM_MATERIALS_FORBIDDEN",
            details: data?.error?.message,
            action: "Reconecte a conta e conceda acesso aos materiais.",
          },
          { status: 403 }
        )
      }

      return Response.json(
        {
          error: "Falha ao buscar materiais no Google Classroom",
          details: data?.error?.message,
        },
        { status: response.status }
      )
    }

    materials.push(...(data?.courseWorkMaterial ?? []))
    pageToken = data?.nextPageToken
  } while (pageToken)

  return Response.json({ courseWorkMaterial: materials })
}
