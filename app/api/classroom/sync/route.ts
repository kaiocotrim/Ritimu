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

type GoogleCourseWork = { id?: string; title?: string; description?: string; dueDate?: { year?: number; month?: number; day?: number }; dueTime?: { hours?: number; minutes?: number }; maxPoints?: number; state?: string; workType?: string; alternateLink?: string }

function dueDateOf(item: GoogleCourseWork) {
  const value = item.dueDate
  if (!value?.year || !value.month || !value.day) return null
  return new Date(value.year, value.month - 1, value.day, item.dueTime?.hours ?? 23, item.dueTime?.minutes ?? 59)
}

export async function POST() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    return Response.json({ error: "Não autenticado" }, { status: 401 })
  }

  const googleAccounts = await prisma.account.findMany({
    where: { userId: session.user.id, providerId: "google" },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  })

  if (!googleAccounts.length) {
    return Response.json(
      { error: "Google Classroom não conectado" },
      { status: 400 }
    )
  }

  const accessTokens: string[] = []
  for (const account of googleAccounts) {
    try {
      const token = await auth.api.getAccessToken({ body: { accountId: account.id }, headers: requestHeaders })
      if (token.accessToken) accessTokens.push(token.accessToken)
    } catch {
      continue
    }
  }
  if (!accessTokens.length) {
    return Response.json(
      { error: "Reconecte sua conta Google Classroom" },
      { status: 401 }
    )
  }

  const coursesById = new Map<string, GoogleCourse>()
  const courseAccessTokens = new Map<string, string>()
  for (const accessToken of accessTokens) {
    let pageToken: string | undefined
    do {
      const url = new URL("https://classroom.googleapis.com/v1/courses")
      url.searchParams.set("courseStates", "ACTIVE")
      url.searchParams.set("pageSize", "100")
      if (pageToken) url.searchParams.set("pageToken", pageToken)
      const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" })
      const data = await response.json().catch(() => null) as GoogleCoursesResponse | null
      if (!response.ok) break
      for (const course of data?.courses ?? []) {
        if (!course.id) continue
        coursesById.set(course.id, course)
        courseAccessTokens.set(course.id, accessToken)
      }
      pageToken = data?.nextPageToken
    } while (pageToken)
  }

  const validCourses = [...coursesById.values()].filter(
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

  const storedCourses = await prisma.classroomCourse.findMany({
    where: { userId: session.user.id, googleCourseId: { in: validCourses.map((course) => course.id) } },
    select: { id: true, googleCourseId: true },
  })
  let syncedAssignments = 0
  let unavailableCourses = 0
  for (const course of storedCourses) {
    const accessToken = courseAccessTokens.get(course.googleCourseId)
    if (!accessToken) {
      unavailableCourses += 1
      continue
    }
    const courseWork: GoogleCourseWork[] = []
    let courseWorkPageToken: string | undefined
    let courseUnavailable = false
    do {
      const courseWorkUrl = new URL(`https://classroom.googleapis.com/v1/courses/${encodeURIComponent(course.googleCourseId)}/courseWork`)
      courseWorkUrl.searchParams.set("pageSize", "100")
      if (courseWorkPageToken) courseWorkUrl.searchParams.set("pageToken", courseWorkPageToken)
      const response = await fetch(courseWorkUrl, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" })
      const data = await response.json().catch(() => null) as { courseWork?: GoogleCourseWork[]; nextPageToken?: string; error?: { message?: string } } | null
      if (!response.ok) {
        if (response.status === 404) {
          unavailableCourses += 1
          courseUnavailable = true
          break
        }
        return Response.json({ error: `Não foi possível importar as atividades de uma disciplina: ${data?.error?.message ?? "falha no Google Classroom"}`, code: response.status === 403 ? "CLASSROOM_SCOPE_REQUIRED" : "CLASSROOM_COURSEWORK_ERROR" }, { status: response.status === 401 || response.status === 403 ? response.status : 502 })
      }
      courseWork.push(...(data?.courseWork ?? []))
      courseWorkPageToken = data?.nextPageToken
    } while (courseWorkPageToken)
    if (courseUnavailable) continue
    const assignments = courseWork.filter((item): item is GoogleCourseWork & { id: string; title: string } => Boolean(item.id && item.title))
    await prisma.$transaction(assignments.map((item) => prisma.classroomAssignment.upsert({
      where: { courseId_googleAssignmentId: { courseId: course.id, googleAssignmentId: item.id } },
      create: { courseId: course.id, googleAssignmentId: item.id, title: item.title, description: item.description, dueDate: dueDateOf(item), maxPoints: item.maxPoints, state: item.state, workType: item.workType, classroomUrl: item.alternateLink },
      update: { title: item.title, description: item.description, dueDate: dueDateOf(item), maxPoints: item.maxPoints, state: item.state, workType: item.workType, classroomUrl: item.alternateLink },
    })))
    syncedAssignments += assignments.length
  }

  if (storedCourses.length > 0 && syncedAssignments === 0) {
    return Response.json({ error: unavailableCourses === storedCourses.length ? "As turmas encontradas não estão mais disponíveis no Google Classroom. Atualize sua participação nas turmas ou reconecte a conta." : "As disciplinas foram sincronizadas, mas o Google Classroom não retornou atividades pendentes para elas.", code: "NO_CLASSROOM_ASSIGNMENTS" }, { status: 422 })
  }

  return Response.json({ synced: validCourses.length, syncedAssignments, unavailableCourses })
}
