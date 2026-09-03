export type MaterialSourceType = "GOOGLE_SLIDES" | "GOOGLE_DOCS" | "GOOGLE_DRIVE_FILE" | "PDF" | "GOOGLE_SITE" | "EXTERNAL_URL"

export type ExtractedMaterialContent = {
  title: string
  sourceType: MaterialSourceType
  sourceUrl: string | null
  text: string
  metadata: Record<string, unknown>
}