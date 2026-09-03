import "server-only"

import type { ExtractedMaterialContent, MaterialSourceType } from "./types"

type GoogleMaterial = {
  title?: string
  url?: string
  alternateLink?: string
  id?: string
  mimeType?: string
}

type SlidesResponse = { title?: string; slides?: Array<{ pageElements?: Array<{ shape?: { text?: { textElements?: Array<{ textRun?: { content?: string } }> } } }> }> }
type DocsResponse = { title?: string; body?: { content?: Array<{ paragraph?: { elements?: Array<{ textRun?: { content?: string } }> } }> } }

function sourceFromUrl(url: string): { type: MaterialSourceType; id: string } {
  const parsed = new URL(url)
  const slidesId = parsed.hostname === "docs.google.com" ? parsed.pathname.match(/^\/presentation(?:\/u\/\d+)?\/d\/([^/]+)/)?.[1] : undefined
  if (slidesId) return { type: "GOOGLE_SLIDES", id: slidesId }
  const docsId = parsed.hostname === "docs.google.com" ? parsed.pathname.match(/^\/document(?:\/u\/\d+)?\/d\/([^/]+)/)?.[1] : undefined
  if (docsId) return { type: "GOOGLE_DOCS", id: docsId }
  if (parsed.hostname === "drive.google.com") return { type: "GOOGLE_DRIVE_FILE", id: parsed.pathname.match(/\/d\/([^/]+)/)?.[1] ?? parsed.searchParams.get("id") ?? "" }
  if (parsed.hostname === "sites.google.com") return { type: "GOOGLE_SITE", id: url }
  return { type: "EXTERNAL_URL", id: url }
}

function compact(parts: string[]) {
  return parts.map((part) => part.replace(/\s+/g, " ").trim()).filter(Boolean).join("\n")
}

export async function extractMaterialContent(input: { material: GoogleMaterial; accessToken: string }): Promise<ExtractedMaterialContent> {
  const sourceUrl = input.material.url ?? input.material.alternateLink ?? null
  if (!sourceUrl) throw new Error("Este material não possui um link acessível.")
  const source = sourceFromUrl(sourceUrl)
  if (!source.id) throw new Error("Não foi possível identificar o arquivo Google deste material.")
  if (source.type === "GOOGLE_SITE") throw new Error("Google Sites privados não podem ser extraídos por uma API oficial neste momento.")
  if (source.type === "EXTERNAL_URL") throw new Error("Este material não é um arquivo Google compatível com o resumo automático.")

  const headers = { Authorization: `Bearer ${input.accessToken}` }
  if (source.type === "GOOGLE_SLIDES") {
    const response = await fetch(`https://slides.googleapis.com/v1/presentations/${encodeURIComponent(source.id)}`, { headers, cache: "no-store" })
    const data = await response.json().catch(() => null) as SlidesResponse | { error?: { message?: string } } | null
    if (!response.ok) throw new Error((data as { error?: { message?: string } } | null)?.error?.message ?? "Não foi possível ler esta apresentação.")
    const text = compact((data as SlidesResponse).slides?.flatMap((slide) => slide.pageElements?.flatMap((element) => element.shape?.text?.textElements?.map((part) => part.textRun?.content ?? "") ?? []) ?? []) ?? [])
    if (!text) throw new Error("Esta apresentação não contém texto extraível.")
    const presentation = data as SlidesResponse
    return { title: presentation.title ?? input.material.title ?? "Apresentação", sourceType: source.type, sourceUrl, text, metadata: { fileId: source.id } }
  }
  if (source.type === "GOOGLE_DOCS") {
    const response = await fetch(`https://docs.googleapis.com/v1/documents/${encodeURIComponent(source.id)}`, { headers, cache: "no-store" })
    const data = await response.json().catch(() => null) as DocsResponse | { error?: { message?: string } } | null
    if (!response.ok) throw new Error((data as { error?: { message?: string } } | null)?.error?.message ?? "Não foi possível ler este documento.")
    const text = compact((data as DocsResponse).body?.content?.flatMap((item) => item.paragraph?.elements?.map((part) => part.textRun?.content ?? "") ?? []) ?? [])
    if (!text) throw new Error("Este documento não contém texto extraível.")
    const document = data as DocsResponse
    return { title: document.title ?? input.material.title ?? "Documento", sourceType: source.type, sourceUrl, text, metadata: { fileId: source.id } }
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(source.id)}?fields=id,name,mimeType,webViewLink`, { headers, cache: "no-store" })
  const data = await response.json().catch(() => null) as { id?: string; name?: string; mimeType?: string; webViewLink?: string; error?: { message?: string } } | null
  if (!response.ok) throw new Error(data?.error?.message ?? "Não foi possível acessar este arquivo do Drive.")
  if (data?.mimeType === "application/vnd.google-apps.presentation" || data?.mimeType === "application/vnd.google-apps.document") throw new Error("Use o link direto do Google Slides ou Google Docs para este arquivo.")
  throw new Error("Este tipo de arquivo do Drive ainda não possui extração no MVP.")
}