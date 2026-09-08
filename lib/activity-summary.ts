export const SUMMARY_URL_ERROR = "Informe uma URL válida começando com http:// ou https://."

export type SummaryProvider = "notion" | "notebooklm" | "other"

export function getSummaryProvider(value: string | null): SummaryProvider {
  try {
    const hostname = new URL(value?.trim() ?? "").hostname.toLowerCase()
    if (["notion.so", "notion.site", "notion.com"].some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) return "notion"
    if (["notebook.google.com", "notebooklm.google.com"].includes(hostname)) return "notebooklm"
  } catch {}
  return "other"
}

export function isSummaryProviderUrl(value: string, provider: Exclude<SummaryProvider, "other">) {
  return getSummaryProvider(value) === provider
}

export function normalizeSummaryUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!/^https?:\/\//i.test(trimmed) || /\s/.test(trimmed)) return null
  try {
    const url = new URL(trimmed)
    if (!url.hostname || url.username || url.password) return null
    return url.href
  } catch {
    return null
  }
}

export function isClassroomItemKey(value: unknown): value is string {
  return typeof value === "string" && /^(coursework|material):[^:\s]+$/.test(value)
}
