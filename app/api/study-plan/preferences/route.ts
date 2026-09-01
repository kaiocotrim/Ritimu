import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"

export async function GET() {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const [preference, availabilities, subjects] = await Promise.all([
    prisma.studyPreference.findUnique({ where: { userId } }),
    prisma.studyAvailability.findMany({ where: { userId }, orderBy: { weekday: "asc" } }),
    prisma.classroomCourse.findMany({ where: { userId }, select: { id: true, name: true, studyPreferences: { where: { userId }, select: { difficulty: true } } }, orderBy: { name: "asc" } }),
  ])
  return Response.json({ preference, availabilities, subjects: subjects.map((item) => ({ id: item.id, name: item.name, difficulty: item.studyPreferences[0]?.difficulty ?? 3 })) })
}

export async function PUT(request: Request) {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const body = await request.json().catch(() => null) as { defaultSessionMinutes?: unknown; breakMinutes?: unknown; maxDailyMinutes?: unknown; studyOnWeekends?: unknown; timeZone?: unknown; syncWithGoogleDefault?: unknown; availabilities?: unknown; subjects?: unknown } | null
  const sessionMinutes = Number(body?.defaultSessionMinutes), breakMinutes = Number(body?.breakMinutes), maxDailyMinutes = Number(body?.maxDailyMinutes)
  if (!Number.isInteger(sessionMinutes) || sessionMinutes < 15 || sessionMinutes > 180 || !Number.isInteger(breakMinutes) || breakMinutes < 0 || breakMinutes > 60 || !Number.isInteger(maxDailyMinutes) || maxDailyMinutes < sessionMinutes || maxDailyMinutes > 720) return Response.json({ error: "Configurações de duração inválidas." }, { status: 400 })
  const availabilities = Array.isArray(body?.availabilities) ? body.availabilities as Array<Record<string, unknown>> : []
  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/
  if (new Set(availabilities.map((item) => item.weekday)).size !== availabilities.length || availabilities.some((item) => !Number.isInteger(item.weekday) || Number(item.weekday) < 0 || Number(item.weekday) > 6 || typeof item.startTime !== "string" || typeof item.endTime !== "string" || !validTime.test(item.startTime) || !validTime.test(item.endTime) || item.startTime >= item.endTime)) return Response.json({ error: "Horários de disponibilidade inválidos." }, { status: 400 })
  const subjects = Array.isArray(body?.subjects) ? body.subjects as Array<Record<string, unknown>> : []
  const courseIds = subjects.map((item) => String(item.courseId))
  const ownedCourses = await prisma.classroomCourse.count({ where: { userId, id: { in: courseIds } } })
  if (ownedCourses !== new Set(courseIds).size || subjects.some((item) => !Number.isInteger(item.difficulty) || Number(item.difficulty) < 1 || Number(item.difficulty) > 5)) return Response.json({ error: "Dificuldades informadas são inválidas." }, { status: 400 })
  const timeZone = typeof body?.timeZone === "string" && Intl.supportedValuesOf("timeZone").includes(body.timeZone) ? body.timeZone : null
  if (!timeZone || typeof body?.studyOnWeekends !== "boolean" || typeof body?.syncWithGoogleDefault !== "boolean") return Response.json({ error: "Preferências gerais inválidas." }, { status: 400 })
  const studyOnWeekends = body.studyOnWeekends
  const syncWithGoogleDefault = body.syncWithGoogleDefault
  await prisma.$transaction(async (tx) => {
    await tx.studyPreference.upsert({ where: { userId }, create: { userId, defaultSessionMinutes: sessionMinutes, breakMinutes, maxDailyMinutes, studyOnWeekends, timeZone, syncWithGoogleDefault }, update: { defaultSessionMinutes: sessionMinutes, breakMinutes, maxDailyMinutes, studyOnWeekends, timeZone, syncWithGoogleDefault } })
    await tx.studyAvailability.deleteMany({ where: { userId } })
    if (availabilities.length) await tx.studyAvailability.createMany({ data: availabilities.map((item) => ({ userId, weekday: Number(item.weekday), startTime: String(item.startTime), endTime: String(item.endTime) })) })
    await tx.studySubjectPreference.deleteMany({ where: { userId } })
    if (subjects.length) await tx.studySubjectPreference.createMany({ data: subjects.map((item) => ({ userId, courseId: String(item.courseId), difficulty: Number(item.difficulty) })) })
  })
  return Response.json({ success: true })
}

export async function PATCH(request: Request) {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const body = await request.json().catch(() => null) as { plannerTheme?: unknown; missionsBackgroundMode?: unknown; missionsBackgroundUrl?: unknown; notificationsEnabled?: unknown; dashboardShowStreak?: unknown; dashboardShowAgenda?: unknown } | null
  if (typeof body?.dashboardShowStreak === "boolean" || typeof body?.dashboardShowAgenda === "boolean") {
    const data = { ...(typeof body.dashboardShowStreak === "boolean" ? { dashboardShowStreak: body.dashboardShowStreak } : {}), ...(typeof body.dashboardShowAgenda === "boolean" ? { dashboardShowAgenda: body.dashboardShowAgenda } : {}) }
    await prisma.studyPreference.upsert({ where: { userId }, create: { userId, ...data }, update: data })
    return Response.json({ success: true, ...data })
  }
  if (typeof body?.notificationsEnabled === "boolean") {
    await prisma.studyPreference.upsert({ where: { userId }, create: { userId, notificationsEnabled: body.notificationsEnabled }, update: { notificationsEnabled: body.notificationsEnabled } })
    return Response.json({ success: true, notificationsEnabled: body.notificationsEnabled })
  }
  if (body?.missionsBackgroundMode !== undefined) {
    const mode = body.missionsBackgroundMode === "DEFAULT" ? "DEFAULT" : body.missionsBackgroundMode === "IMAGE" ? "IMAGE" : null
    if (!mode) return Response.json({ error: "Opção de fundo inválida." }, { status: 400 })
    let url: string | null = null
    if (mode === "IMAGE") {
      if (typeof body.missionsBackgroundUrl !== "string" || body.missionsBackgroundUrl.length > 2048) return Response.json({ error: "Informe uma URL de imagem válida." }, { status: 400 })
      try {
        const parsedUrl = new URL(body.missionsBackgroundUrl)
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new Error("invalid protocol")
        url = parsedUrl.toString()
      } catch {
        return Response.json({ error: "Informe uma URL iniciada com http:// ou https://." }, { status: 400 })
      }
    }
    await prisma.studyPreference.upsert({ where: { userId }, create: { userId, missionsBackgroundMode: mode, missionsBackgroundUrl: url }, update: { missionsBackgroundMode: mode, missionsBackgroundUrl: url } })
    return Response.json({ success: true, missionsBackgroundMode: mode, missionsBackgroundUrl: url })
  }
  const plannerTheme = body?.plannerTheme === "LIGHT" ? "LIGHT" : body?.plannerTheme === "SPACE" ? "SPACE" : null
  if (!plannerTheme) return Response.json({ error: "Tema inválido." }, { status: 400 })
  await prisma.studyPreference.upsert({ where: { userId }, create: { userId, plannerTheme }, update: { plannerTheme } })
  return Response.json({ success: true, plannerTheme })
}
