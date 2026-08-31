import "server-only"

import { googleCalendarRequest, GoogleCalendarError, GOOGLE_PRIMARY_CALENDAR, type GoogleCalendarEvent, toGoogleEvent } from "@/lib/google-calendar"

export type StudyPlanGoogleEvent = {
  title: string
  description?: string | null
  startAt: Date
  endAt?: Date | null
  allDay?: boolean
  recurrence?: string
  recurrenceDays?: number[]
}

export async function createStudyPlanGoogleEvent(userId: string, event: StudyPlanGoogleEvent) {
  const remote = await googleCalendarRequest<GoogleCalendarEvent>(userId, `/calendars/${GOOGLE_PRIMARY_CALENDAR}/events`, {
    method: "POST",
    body: JSON.stringify(toGoogleEvent({ ...event, allDay: event.allDay ?? false })),
  })
  if (!remote.id) throw new Error("O Google Calendar não retornou o identificador do evento.")
  return { googleEventId: remote.id, googleCalendarId: GOOGLE_PRIMARY_CALENDAR, syncedWithGoogle: true, googleUpdatedAt: remote.updated ? new Date(remote.updated) : new Date() }
}

export async function updateStudyPlanGoogleEvent(userId: string, googleEventId: string, event: StudyPlanGoogleEvent, googleCalendarId = GOOGLE_PRIMARY_CALENDAR) {
  const remote = await googleCalendarRequest<GoogleCalendarEvent>(userId, `/calendars/${googleCalendarId}/events/${encodeURIComponent(googleEventId)}`, {
    method: "PATCH",
    body: JSON.stringify(toGoogleEvent({ ...event, allDay: event.allDay ?? false })),
  })
  return { syncedWithGoogle: true, googleUpdatedAt: remote.updated ? new Date(remote.updated) : new Date() }
}

export async function deleteStudyPlanGoogleEvent(userId: string, googleEventId: string, googleCalendarId = GOOGLE_PRIMARY_CALENDAR) {
  await googleCalendarRequest(userId, `/calendars/${googleCalendarId}/events/${encodeURIComponent(googleEventId)}`, { method: "DELETE" })
}

export function studyPlanGoogleErrorResponse(error: unknown) {
  if (error instanceof GoogleCalendarError) return Response.json({ error: error.message, code: error.code }, { status: error.status })
  console.error("Study plan Google Calendar sync failed", error)
  return Response.json({ error: "Não foi possível salvar no Google Calendar. Tente novamente." }, { status: 502 })
}
