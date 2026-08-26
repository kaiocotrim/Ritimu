import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CalendarEventSource, CalendarEventStatus, CalendarEventType } from "@/lib/generated/prisma/enums"
import { getGoogleCalendarConnection, googleCalendarRequest, GoogleCalendarError, GOOGLE_PRIMARY_CALENDAR, GoogleCalendarEvent, toGoogleEvent } from "@/lib/google-calendar"

const eventTypes = new Set(Object.values(CalendarEventType))
type EventInput = { title?: unknown; description?: unknown; startAt?: unknown; endAt?: unknown; allDay?: unknown; type?: unknown; addToGoogle?: unknown }

function parseEventInput(value: unknown) {
  const body = value as EventInput
  const title = typeof body?.title === "string" ? body.title.trim() : ""
  const startAt = typeof body?.startAt === "string" ? new Date(body.startAt) : null
  const endAt = typeof body?.endAt === "string" && body.endAt ? new Date(body.endAt) : null
  if (!title || title.length > 200) return { error: "Informe um título válido de até 200 caracteres." } as const
  if (!startAt || Number.isNaN(startAt.getTime())) return { error: "Informe uma data inicial válida." } as const
  if (endAt && (Number.isNaN(endAt.getTime()) || endAt <= startAt)) return { error: "A data final deve ser posterior à data inicial." } as const
  const type = typeof body.type === "string" && eventTypes.has(body.type as CalendarEventType) ? body.type as CalendarEventType : CalendarEventType.STUDY
  return { data: { title, description: typeof body.description === "string" ? body.description.trim().slice(0, 5000) || null : null, startAt, endAt, allDay: body.allDay === true, type, addToGoogle: body.addToGoogle === true } } as const
}

async function getSession() {
  const requestHeaders = await headers()
  return auth.api.getSession({ headers: requestHeaders })
}

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const url = new URL(request.url)
  const from = new Date(url.searchParams.get("from") ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  const to = new Date(url.searchParams.get("to") ?? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString())
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) return Response.json({ error: "Intervalo de datas inválido." }, { status: 400 })

  const connection = await getGoogleCalendarConnection(session.user.id)
  let syncError: string | null = null
  if (connection.connected) {
    try {
      const params = new URLSearchParams({ timeMin: from.toISOString(), timeMax: to.toISOString(), singleEvents: "true", orderBy: "startTime", maxResults: "2500", timeZone: "America/Sao_Paulo" })
      const remote = await googleCalendarRequest<{ items?: GoogleCalendarEvent[] }>(session.user.id, `/calendars/${GOOGLE_PRIMARY_CALENDAR}/events?${params}`)
      const valid = (remote.items ?? []).filter((item): item is GoogleCalendarEvent & { id: string } => Boolean(item.id && item.start && item.status !== "cancelled"))
      await prisma.$transaction(valid.map((item) => {
        const startValue = item.start?.dateTime ?? `${item.start?.date}T00:00:00-03:00`
        const endValue = item.end?.dateTime ?? (item.end?.date ? `${item.end.date}T00:00:00-03:00` : null)
        return prisma.calendarEvent.upsert({
          where: { userId_googleCalendarId_googleEventId: { userId: session.user.id, googleCalendarId: GOOGLE_PRIMARY_CALENDAR, googleEventId: item.id } },
          create: { userId: session.user.id, title: item.summary?.trim() || "Evento sem título", description: item.description, startAt: new Date(startValue), endAt: endValue ? new Date(endValue) : null, allDay: Boolean(item.start?.date), source: CalendarEventSource.GOOGLE, type: CalendarEventType.OTHER, googleEventId: item.id, googleCalendarId: GOOGLE_PRIMARY_CALENDAR, syncedWithGoogle: true, googleUpdatedAt: item.updated ? new Date(item.updated) : null },
          update: { title: item.summary?.trim() || "Evento sem título", description: item.description, startAt: new Date(startValue), endAt: endValue ? new Date(endValue) : null, allDay: Boolean(item.start?.date), syncedWithGoogle: true, googleUpdatedAt: item.updated ? new Date(item.updated) : null },
        })
      }))
    } catch (error) { syncError = error instanceof GoogleCalendarError ? error.message : "Não foi possível sincronizar o Google Calendar." }
  }
  const events = await prisma.calendarEvent.findMany({ where: { userId: session.user.id, startAt: { gte: from, lt: to }, status: { not: CalendarEventStatus.CANCELED } }, orderBy: { startAt: "asc" } })
  return Response.json({ events, google: { connected: connection.connected, hasRefreshToken: connection.hasRefreshToken }, syncError })
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const parsed = parseEventInput(await request.json().catch(() => null))
  if ("error" in parsed) return Response.json({ error: parsed.error }, { status: 400 })
  const { addToGoogle, ...data } = parsed.data
  try {
    if (!addToGoogle) return Response.json({ event: await prisma.calendarEvent.create({ data: { ...data, userId: session.user.id } }) }, { status: 201 })
    const google = await googleCalendarRequest<GoogleCalendarEvent>(session.user.id, `/calendars/${GOOGLE_PRIMARY_CALENDAR}/events`, { method: "POST", body: JSON.stringify(toGoogleEvent(data)) })
    if (!google.id) throw new GoogleCalendarError("API_ERROR", "O Google não retornou o identificador do evento.", 502)
    const event = await prisma.calendarEvent.create({ data: { ...data, userId: session.user.id, googleEventId: google.id, googleCalendarId: GOOGLE_PRIMARY_CALENDAR, syncedWithGoogle: true, googleUpdatedAt: google.updated ? new Date(google.updated) : null } })
    return Response.json({ event }, { status: 201 })
  } catch (error) { return calendarErrorResponse(error) }
}

export function calendarErrorResponse(error: unknown) {
  if (error instanceof GoogleCalendarError) return Response.json({ error: error.message, code: error.code }, { status: error.status })
  console.error("Calendar operation failed", error)
  return Response.json({ error: "Não foi possível concluir a operação." }, { status: 500 })
}
