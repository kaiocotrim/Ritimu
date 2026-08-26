import "server-only"

import { prisma } from "@/lib/prisma"
import { GOOGLE_CALENDAR_SCOPE } from "@/lib/google-classroom"

export const GOOGLE_PRIMARY_CALENDAR = "primary"
export const RITIMU_TIME_ZONE = "America/Sao_Paulo"

export class GoogleCalendarError extends Error {
  constructor(public code: "NOT_CONNECTED" | "SCOPE_REQUIRED" | "REAUTH_REQUIRED" | "API_ERROR", message: string, public status = 400) {
    super(message)
  }
}

type GoogleAccount = { id: string; accessToken: string | null; refreshToken: string | null; accessTokenExpiresAt: Date | null; scope: string | null }
type GoogleEventDate = { date?: string; dateTime?: string; timeZone?: string }
export type GoogleCalendarEvent = { id?: string; status?: string; summary?: string; description?: string; updated?: string; start?: GoogleEventDate; end?: GoogleEventDate }

function hasCalendarScope(scope: string | null) {
  return scope?.split(/[ ,]+/).includes(GOOGLE_CALENDAR_SCOPE) ?? false
}

export async function getGoogleCalendarConnection(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "google" },
    select: { id: true, accessToken: true, refreshToken: true, accessTokenExpiresAt: true, scope: true },
  })
  return { account, connected: Boolean(account && hasCalendarScope(account.scope)), hasRefreshToken: Boolean(account?.refreshToken) }
}

async function refreshGoogleToken(account: GoogleAccount) {
  if (!account.refreshToken) throw new GoogleCalendarError("REAUTH_REQUIRED", "Reconecte sua conta Google para permitir acesso offline ao Calendar.", 401)
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new GoogleCalendarError("API_ERROR", "Credenciais do Google não configuradas no servidor.", 500)

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: account.refreshToken, grant_type: "refresh_token" }),
    cache: "no-store",
  })
  const data = await response.json().catch(() => null) as { access_token?: string; expires_in?: number; error?: string } | null
  if (!response.ok || !data?.access_token) {
    const revoked = data?.error === "invalid_grant"
    throw new GoogleCalendarError("REAUTH_REQUIRED", revoked ? "O acesso ao Google foi revogado. Conecte novamente." : "Não foi possível renovar o acesso ao Google Calendar.", 401)
  }
  const expiresAt = new Date(Date.now() + (data.expires_in ?? 3600) * 1000)
  await prisma.account.update({ where: { id: account.id }, data: { accessToken: data.access_token, accessTokenExpiresAt: expiresAt } })
  return data.access_token
}

export async function getGoogleCalendarAccessToken(userId: string) {
  const { account, connected } = await getGoogleCalendarConnection(userId)
  if (!account) throw new GoogleCalendarError("NOT_CONNECTED", "Nenhuma conta Google está vinculada.", 400)
  if (!connected) throw new GoogleCalendarError("SCOPE_REQUIRED", "Autorize o acesso ao Google Calendar.", 403)
  if (account.accessToken && account.accessTokenExpiresAt && account.accessTokenExpiresAt.getTime() > Date.now() + 60_000) return account.accessToken
  return refreshGoogleToken(account)
}

export async function googleCalendarRequest<T>(userId: string, path: string, init?: RequestInit): Promise<T> {
  const accessToken = await getGoogleCalendarAccessToken(userId)
  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  })
  if (response.status === 401) throw new GoogleCalendarError("REAUTH_REQUIRED", "A autorização do Google expirou ou foi revogada.", 401)
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new GoogleCalendarError("API_ERROR", (data as { error?: { message?: string } } | null)?.error?.message ?? "Falha na comunicação com o Google Calendar.", response.status === 403 ? 403 : 502)
  return data as T
}

export function toGoogleEvent(input: { title: string; description?: string | null; startAt: Date; endAt?: Date | null; allDay: boolean }) {
  if (input.allDay) {
    const date = input.startAt.toISOString().slice(0, 10)
    const end = input.endAt ?? new Date(input.startAt.getTime() + 86_400_000)
    return { summary: input.title, description: input.description ?? undefined, start: { date }, end: { date: end.toISOString().slice(0, 10) } }
  }
  return { summary: input.title, description: input.description ?? undefined, start: { dateTime: input.startAt.toISOString(), timeZone: RITIMU_TIME_ZONE }, end: { dateTime: (input.endAt ?? new Date(input.startAt.getTime() + 3_600_000)).toISOString(), timeZone: RITIMU_TIME_ZONE } }
}
