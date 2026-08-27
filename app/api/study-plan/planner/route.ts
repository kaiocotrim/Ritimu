import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { CalendarEventStatus, StudyPlanPeriodType } from "@/lib/generated/prisma/enums"
import { prisma } from "@/lib/prisma"

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

export async function GET(request: Request) {
  const id = await userId()
  if (!id) return Response.json({ error: "Não autenticado" }, { status: 401 })

  const url = new URL(request.url)
  const from = new Date(url.searchParams.get("from") ?? "")
  const to = new Date(url.searchParams.get("to") ?? "")
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to || to.getTime() - from.getTime() > 70 * 86_400_000) {
    return Response.json({ error: "Intervalo inválido." }, { status: 400 })
  }

  const [preference, courses, events] = await Promise.all([
    prisma.studyPreference.findUnique({ where: { userId: id }, select: { plannerView: true } }),
    prisma.classroomCourse.findMany({
      where: { userId: id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.calendarEvent.findMany({
      where: {
        userId: id,
        status: { not: CalendarEventStatus.CANCELED },
        startAt: { lt: to },
        OR: [{ startAt: { gte: from } }, { recurrence: { not: "NONE" } }],
      },
      include: { studySession: { select: { courseId: true, subjectName: true } } },
      orderBy: { startAt: "asc" },
    }),
  ])

  return Response.json({ configured: Boolean(preference?.plannerView), view: preference?.plannerView ?? null, courses, events })
}

export async function PUT(request: Request) {
  const id = await userId()
  if (!id) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const body = await request.json().catch(() => null) as { view?: unknown } | null
  const view = body?.view === StudyPlanPeriodType.WEEKLY || body?.view === StudyPlanPeriodType.MONTHLY ? body.view : null
  if (!view) return Response.json({ error: "Visualização inválida." }, { status: 400 })

  const preference = await prisma.studyPreference.upsert({
    where: { userId: id },
    create: { userId: id, plannerView: view },
    update: { plannerView: view },
    select: { plannerView: true },
  })
  return Response.json({ configured: true, view: preference.plannerView })
}
