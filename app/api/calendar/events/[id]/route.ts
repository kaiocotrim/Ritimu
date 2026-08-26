import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CalendarEventType } from "@/lib/generated/prisma/enums"
import { calendarErrorResponse } from "@/app/api/calendar/events/route"
import { googleCalendarRequest, GOOGLE_PRIMARY_CALENDAR, toGoogleEvent } from "@/lib/google-calendar"

async function authenticatedUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.id ?? null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticatedUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const { id } = await params
  const existing = await prisma.calendarEvent.findFirst({ where: { id, userId } })
  if (!existing) return Response.json({ error: "Evento não encontrado." }, { status: 404 })
  const body = await request.json().catch(() => null) as Record<string, unknown> | null
  if (!body) return Response.json({ error: "Dados inválidos." }, { status: 400 })
  const title = typeof body.title === "string" ? body.title.trim() : existing.title
  const startAt = typeof body.startAt === "string" ? new Date(body.startAt) : existing.startAt
  const endAt = typeof body.endAt === "string" && body.endAt ? new Date(body.endAt) : body.endAt === null ? null : existing.endAt
  if (!title || title.length > 200 || Number.isNaN(startAt.getTime()) || (endAt && (Number.isNaN(endAt.getTime()) || endAt <= startAt))) return Response.json({ error: "Título ou datas inválidos." }, { status: 400 })
  const data = { title, description: typeof body.description === "string" ? body.description.trim().slice(0, 5000) || null : existing.description, startAt, endAt, allDay: typeof body.allDay === "boolean" ? body.allDay : existing.allDay, type: typeof body.type === "string" && Object.values(CalendarEventType).includes(body.type as CalendarEventType) ? body.type as CalendarEventType : existing.type }
  try {
    if (existing.syncedWithGoogle && existing.googleEventId) await googleCalendarRequest(userId, `/calendars/${existing.googleCalendarId ?? GOOGLE_PRIMARY_CALENDAR}/events/${encodeURIComponent(existing.googleEventId)}`, { method: "PATCH", body: JSON.stringify(toGoogleEvent(data)) })
    return Response.json({ event: await prisma.calendarEvent.update({ where: { id }, data }) })
  } catch (error) { return calendarErrorResponse(error) }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await authenticatedUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const { id } = await params
  const existing = await prisma.calendarEvent.findFirst({ where: { id, userId } })
  if (!existing) return Response.json({ error: "Evento não encontrado." }, { status: 404 })
  try {
    if (existing.syncedWithGoogle && existing.googleEventId) await googleCalendarRequest(userId, `/calendars/${existing.googleCalendarId ?? GOOGLE_PRIMARY_CALENDAR}/events/${encodeURIComponent(existing.googleEventId)}`, { method: "DELETE" })
    await prisma.calendarEvent.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch (error) { return calendarErrorResponse(error) }
}
