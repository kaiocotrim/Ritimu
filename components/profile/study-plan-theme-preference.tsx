"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, LoaderCircle, MoonStar, Sun } from "lucide-react"

type Theme = "SPACE" | "LIGHT"

export function StudyPlanThemePreference({ initialTheme }: { initialTheme: Theme }) {
  const router = useRouter()
  const [theme, setTheme] = useState(initialTheme)
  const [saving, setSaving] = useState<Theme | null>(null)
  const [error, setError] = useState("")

  async function choose(nextTheme: Theme) {
    if (nextTheme === theme || saving) return
    setSaving(nextTheme)
    setError("")
    const response = await fetch("/api/study-plan/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plannerTheme: nextTheme }),
    })
    const body = await response.json().catch(() => null)
    if (response.ok) {
      setTheme(nextTheme)
      document.documentElement.classList.toggle("dark", nextTheme === "SPACE")
      router.refresh()
    }
    else setError(body?.error ?? "Não foi possível alterar o tema.")
    setSaving(null)
  }

  return <div className="py-4">
    <p className="font-medium">Tema do site</p>
    <p className="mt-1 text-sm text-black/45">Escolha a aparência clara ou escura do Ritimu.</p>
    <div className="mt-3 grid grid-cols-2 gap-2">
      <ThemeButton label="Escuro" active={theme === "SPACE"} busy={saving === "SPACE"} icon={MoonStar} onClick={() => void choose("SPACE")} />
      <ThemeButton label="Claro" active={theme === "LIGHT"} busy={saving === "LIGHT"} icon={Sun} onClick={() => void choose("LIGHT")} />
    </div>
    {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
  </div>
}

function ThemeButton({ label, active, busy, icon: Icon, onClick }: { label: string; active: boolean; busy: boolean; icon: typeof Sun; onClick: () => void }) {
  return <button type="button" aria-pressed={active} disabled={busy} onClick={onClick} className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${active ? "border-[#50D05C] bg-[#50D05C]/10 text-[#2f8f3a]" : "border-black/[.08] bg-black/[.02] text-black/55 hover:border-black/15"}`}><Icon className="size-4" /><span className="flex-1 text-left">{label}</span>{busy ? <LoaderCircle className="size-4 animate-spin" /> : active ? <Check className="size-4" /> : null}</button>
}
