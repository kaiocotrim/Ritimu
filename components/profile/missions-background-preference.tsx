"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ImageIcon, LoaderCircle, RotateCcw } from "lucide-react"

type BackgroundMode = "DEFAULT" | "IMAGE"

export function MissionsBackgroundPreference({
  initialMode,
  initialUrl,
}: {
  initialMode: BackgroundMode
  initialUrl: string
}) {
  const router = useRouter()
  const [mode, setMode] = useState<BackgroundMode>(initialMode)
  const [url, setUrl] = useState(initialUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function save(nextMode = mode) {
    if (saving) return
    setSaving(true)
    setError("")
    const response = await fetch("/api/study-plan/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        missionsBackgroundMode: nextMode,
        missionsBackgroundUrl: nextMode === "IMAGE" ? url.trim() : null,
      }),
    })
    const body = await response.json().catch(() => null)
    if (response.ok) {
      setMode(nextMode)
      if (nextMode === "DEFAULT") setUrl("")
      router.refresh()
    } else {
      setError(body?.error ?? "Não foi possível salvar o fundo de Missões.")
    }
    setSaving(false)
  }

  return (
    <div className="py-4">
      <p className="font-medium">Plano de fundo de Missões</p>
      <p className="mt-1 text-sm text-black/45">Use o visual padrão ou uma imagem através de uma URL.</p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={mode === "DEFAULT"}
          disabled={saving}
          onClick={() => void save("DEFAULT")}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${mode === "DEFAULT" ? "border-[#50D05C] bg-[#50D05C]/10 text-[#2f8f3a]" : "border-black/[.08] bg-black/[.02] text-black/55 hover:border-black/15"}`}
        >
          <RotateCcw className="size-4" />
          <span className="flex-1 text-left">Tema padrão</span>
          {mode === "DEFAULT" && !saving ? <Check className="size-4" /> : null}
        </button>
        <button
          type="button"
          aria-pressed={mode === "IMAGE"}
          disabled={saving}
          onClick={() => setMode("IMAGE")}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${mode === "IMAGE" ? "border-[#50D05C] bg-[#50D05C]/10 text-[#2f8f3a]" : "border-black/[.08] bg-black/[.02] text-black/55 hover:border-black/15"}`}
        >
          <ImageIcon className="size-4" />
          <span className="flex-1 text-left">Usar imagem</span>
          {mode === "IMAGE" && initialMode === "IMAGE" && !saving ? <Check className="size-4" /> : null}
        </button>
      </div>

      {mode === "IMAGE" ? (
        <div className="mt-3 space-y-2">
          <label htmlFor="missions-background-url" className="text-xs font-semibold text-black/55">URL da imagem</label>
          <div className="flex gap-2">
            <input
              id="missions-background-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://exemplo.com/fundo.jpg"
              className="min-w-0 flex-1 rounded-xl border border-black/10 bg-black/[.02] px-3 py-2.5 text-sm outline-none transition focus:border-[#50D05C]"
            />
            <button type="button" disabled={saving || !url.trim()} onClick={() => void save("IMAGE")} className="inline-flex items-center gap-2 rounded-xl bg-[#50D05C] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50">
              {saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}
              Salvar
            </button>
          </div>
          {url.trim() ? <div className="h-24 rounded-2xl border border-black/10 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(url.trim())})` }} aria-label="Prévia da imagem" /> : null}
        </div>
      ) : null}

      {error ? <p role="alert" className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  )
}
