import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type GoogleCourse = {
  id?: string
  name?: string
  section?: string
  alternateLink?: string
  calendarId?: string
  courseState?: string
}

type GoogleCoursesResponse = {
  courses?: GoogleCourse[]
  nextPageToken?: string
  error?: { message?: string }
}

export async function POST() {
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
      { error: "Reconecte sua conta Google Classroom" },
      { status: 401 }
    )
  }

  const courses: GoogleCourse[] = []
  let pageToken: string | undefined

  do {
    const url = new URL("https://classroom.googleapis.com/v1/courses")
    url.searchParams.set("courseStates", "ACTIVE")
    url.searchParams.set("pageSize", "100")
    if (pageToken) url.searchParams.set("pageToken", pageToken)

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    const data = (await response.json().catch(() => null)) as
      | GoogleCoursesResponse
      | null

    if (!response.ok) {
      return Response.json(
        {
          error:
            data?.error?.message ??
            "Não foi possível buscar as matérias no Google Classroom",
        },
        { status: response.status === 403 ? 403 : 502 }
      )
    }

    courses.push(...(data?.courses ?? []))
    pageToken = data?.nextPageToken
  } while (pageToken)

  const validCourses = courses.filter(
    (course): course is GoogleCourse & { id: string; name: string } =>
      Boolean(course.id && course.name)
  )

  await prisma.$transaction(
    validCourses.map((course) =>
      prisma.classroomCourse.upsert({
        where: {
          userId_googleCourseId: {
            userId: session.user.id,
            googleCourseId: course.id,
          },
        },
        create: {
          userId: session.user.id,
          googleCourseId: course.id,
          name: course.name,
          section: course.section,
          classroomUrl: course.alternateLink,
          calendarId: course.calendarId,
          courseState: course.courseState ?? "ACTIVE",
        },
        update: {
          name: course.name,
          section: course.section,
          classroomUrl: course.alternateLink,
          calendarId: course.calendarId,
          courseState: course.courseState ?? "ACTIVE",
        },
      })
    )
  )

  return Response.json({ synced: validCourses.length })
}
