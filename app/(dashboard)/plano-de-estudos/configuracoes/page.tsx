"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowLeft, CalendarDays, Check, LoaderCircle } from "lucide-react"
import { Sidebar } from "@/components/sidebar/sidebar"

type Availability = { weekday: number; startTime: string; endTime: string }
type Subject = { id: string; name: string; difficulty: number }
const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export default function StudyPlanSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [form, setForm] = useState({
    defaultSessionMinutes: 40,
    breakMinutes: 10,
    maxDailyMinutes: 120,
    studyOnWeekends: false,
    syncWithGoogleDefault: false,
    timeZone: "America/Sao_Paulo",
    availabilities: [1, 3, 5].map((weekday) => ({ weekday, startTime: "19:00", endTime: "21:00" })) as Availability[],
  })

  useEffect(() => {
    const controller = new AbortController()
    void fetch("/api/study-plan/preferences", { signal: controller.signal }).then(async (response) => {
      const data = await response.json()
      if (data.preference) setForm((current) => ({ ...current, ...data.preference, availabilities: data.availabilities.length ? data.availabilities : current.availabilities }))
      setSubjects(data.subjects ?? [])
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => controller.abort()
  }, [])

  function toggleDay(weekday: number) {
    setForm((current) => {
      const exists = current.availabilities.some((item) => item.weekday === weekday)
      const availabilities = exists ? current.availabilities.filter((item) => item.weekday !== weekday) : [...current.availabilities, { weekday, startTime: "19:00", endTime: "21:00" }].sort((a, b) => a.weekday - b.weekday)
      return { ...current, availabilities, studyOnWeekends: availabilities.some((item) => item.weekday === 0 || item.weekday === 6) }
    })
  }

  async function save() {
    setSaving(true); setMessage(null)
    const response = await fetch("/api/study-plan/preferences", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, subjects: subjects.map((item) => ({ courseId: item.id, difficulty: item.difficulty })) }) })
    const data = await response.json().catch(() => null)
    setSaving(false)
    setMessage(response.ok ? "Configuração salva com sucesso." : data?.error ?? "Não foi possível salvar.")
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f6f5f1]"><LoaderCircle className="animate-spin text-[#50d05c]" /></main>

  return <main className="min-h-screen bg-[#f6f5f1] px-5 pb-32 pt-8 text-[#171717] sm:px-8"><div className="mx-auto max-w-4xl">
    <Link href="/plano-de-estudos" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-black/45 hover:text-black"><ArrowLeft className="size-4" />Meu plano</Link>
    <header className="mb-8"><p className="text-sm font-semibold text-[#45b950]">PLANEJADOR INTELIGENTE</p><h1 className="mt-1 text-4xl font-semibold tracking-tight">Sua disponibilidade</h1><p className="mt-2 text-black/45">Escolha quando o Ritimu pode organizar seus estudos.</p></header>
    {message && <div className="mb-5 rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm">{message}</div>}
    <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-[28px] bg-white p-6 shadow-sm sm:p-8"><div className="mb-5 flex items-center gap-3"><CalendarDays className="size-5 text-[#50d05c]" /><h2 className="text-xl font-semibold">Dias e horários</h2></div><div className="mb-6 grid grid-cols-7 gap-2">{days.map((day, weekday) => { const active = form.availabilities.some((item) => item.weekday === weekday); return <button key={day} onClick={() => toggleDay(weekday)} className={`rounded-2xl py-3 text-xs font-semibold transition ${active ? "bg-[#50d05c] text-white" : "bg-black/[.04] text-black/35 hover:bg-black/[.08]"}`}>{day}</button> })}</div><div className="space-y-3">{form.availabilities.map((item) => <div key={item.weekday} className="grid grid-cols-[1fr_105px_105px] items-center gap-3 rounded-2xl border border-black/[.06] p-3"><span className="font-semibold">{days[item.weekday]}</span><input aria-label={`Início de ${days[item.weekday]}`} type="time" value={item.startTime} onChange={(event) => setForm({ ...form, availabilities: form.availabilities.map((current) => current.weekday === item.weekday ? { ...current, startTime: event.target.value } : current) })} className="rounded-xl border p-2 text-sm" /><input aria-label={`Fim de ${days[item.weekday]}`} type="time" value={item.endTime} onChange={(event) => setForm({ ...form, availabilities: form.availabilities.map((current) => current.weekday === item.weekday ? { ...current, endTime: event.target.value } : current) })} className="rounded-xl border p-2 text-sm" /></div>)}</div>{!form.availabilities.length && <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-black/40">Selecione pelo menos um dia de estudo.</p>}</section>
      <div className="space-y-6"><section className="rounded-[28px] bg-[#171717] p-6 text-white"><h2 className="mb-5 text-xl font-semibold">Ritmo das sessões</h2><div className="space-y-4"><NumberInput label="Duração da sessão" value={form.defaultSessionMinutes} onChange={(value) => setForm({ ...form, defaultSessionMinutes: value })} /><NumberInput label="Pausa entre sessões" value={form.breakMinutes} onChange={(value) => setForm({ ...form, breakMinutes: value })} /><NumberInput label="Limite diário" value={form.maxDailyMinutes} onChange={(value) => setForm({ ...form, maxDailyMinutes: value })} /></div></section><section className="rounded-[28px] bg-white p-6"><h2 className="mb-4 font-semibold">Preferências gerais</h2><label className="mb-4 flex items-center justify-between gap-3 text-sm"><span>Estudar aos finais de semana</span><input type="checkbox" checked={form.studyOnWeekends} onChange={(event) => setForm({ ...form, studyOnWeekends: event.target.checked })} className="size-4 accent-[#50d05c]" /></label><label className="mb-4 flex items-center justify-between gap-3 text-sm"><span>Sincronizar com Google Calendar</span><input type="checkbox" checked={form.syncWithGoogleDefault} onChange={(event) => setForm({ ...form, syncWithGoogleDefault: event.target.checked })} className="size-4 accent-[#50d05c]" /></label><label className="block text-sm">Fuso horário<select value={form.timeZone} onChange={(event) => setForm({ ...form, timeZone: event.target.value })} className="mt-2 w-full rounded-xl border p-3"><option value="America/Sao_Paulo">Brasília — São Paulo</option><option value="America/Manaus">Manaus</option><option value="America/Cuiaba">Cuiabá</option><option value="America/Rio_Branco">Rio Branco</option><option value="America/Noronha">Fernando de Noronha</option></select></label></section></div>
    </div>
    {subjects.length > 0 && <section className="mt-6 rounded-[28px] bg-white p-6 sm:p-8"><h2 className="mb-5 text-xl font-semibold">Dificuldade das matérias</h2><div className="grid gap-3 sm:grid-cols-2">{subjects.map((subject, index) => <label key={subject.id} className="flex items-center justify-between gap-3 rounded-2xl border border-black/[.06] p-4 text-sm"><span className="font-semibold">{subject.name}</span><select value={subject.difficulty} onChange={(event) => { const copy = [...subjects]; copy[index] = { ...subject, difficulty: Number(event.target.value) }; setSubjects(copy) }} className="rounded-xl border px-3 py-2"><option value="1">Muito fácil</option><option value="2">Fácil</option><option value="3">Média</option><option value="4">Difícil</option><option value="5">Muito difícil</option></select></label>)}</div></section>}
    <button disabled={saving || !form.availabilities.length} onClick={save} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#50d05c] py-4 font-semibold text-white transition hover:bg-[#45b950] disabled:opacity-50">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}{saving ? "Salvando..." : "Salvar disponibilidade"}</button>
  </div><Sidebar /></main>
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <label className="flex items-center justify-between gap-3 text-sm text-white/70"><span>{label}</span><span className="flex items-center gap-2"><input type="number" min="0" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-20 rounded-xl border border-white/10 bg-white/10 p-2 text-right text-white" /> min</span></label> }
