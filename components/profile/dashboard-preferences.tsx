"use client"

import { useState } from "react"
import { LayoutDashboard, LoaderCircle } from "lucide-react"

export function DashboardPreferences({ initialStreak, initialAgenda }: { initialStreak: boolean; initialAgenda: boolean }) {
  const [values, setValues] = useState({ dashboardShowStreak: initialStreak, dashboardShowAgenda: initialAgenda })
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState("")
  async function toggle(key: keyof typeof values) {
    const next = !values[key]; setSaving(key); setError("")
    const response = await fetch("/api/study-plan/preferences", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ [key]: next }) })
    if (response.ok) setValues((current) => ({ ...current, [key]: next }))
    else setError("Não foi possível personalizar o Dashboard.")
    setSaving(null)
  }
  return <div className="py-4"><div className="flex items-center gap-2"><LayoutDashboard className="size-5 text-black/45" /><p className="font-medium">Cards do Dashboard</p></div><p className="mt-1 text-sm text-black/45">Escolha o que aparece na sua tela inicial.</p><div className="mt-3 space-y-2">{[["dashboardShowStreak", "Sequência"], ["dashboardShowAgenda", "Agenda de hoje"]].map(([key, label]) => <label key={key} className="flex items-center gap-3 rounded-xl border border-black/[.07] px-4 py-3 text-sm font-medium"><span className="flex-1">{label}</span>{saving === key ? <LoaderCircle className="size-4 animate-spin" /> : <input type="checkbox" checked={values[key as keyof typeof values]} onChange={() => void toggle(key as keyof typeof values)} className="size-4 accent-[#50D05C]" />}</label>)}</div>{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</div>
}
