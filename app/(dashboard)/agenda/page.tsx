"use client"

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react"
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Cloud, LoaderCircle, Pencil, Plus, Settings, Trash2, X } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { Sidebar } from "@/components/sidebar/sidebar"
import { authClient } from "@/lib/auth-client"
import { GOOGLE_RITIMU_SCOPES } from "@/lib/google-classroom"

type CalendarEvent = { id: string; title: string; description: string | null; startAt: string; endAt: string | null; allDay: boolean; source: "RITIMU" | "GOOGLE" | "CLASSROOM"; type: string; syncedWithGoogle: boolean }
type FormState = { title: string; description: string; startAt: string; endAt: string; allDay: boolean; type: string; addToGoogle: boolean }
const emptyForm: FormState = { title: "", description: "", startAt: "", endAt: "", allDay: false, type: "STUDY", addToGoogle: false }
const weekDays = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]
const sourceLabels = { RITIMU: "Ritimu", GOOGLE: "Google", CLASSROOM: "Classroom" }
const sourceClasses = { RITIMU: "bg-[#e9f9eb] text-[#328a3b]", GOOGLE: "bg-sky-100 text-sky-700", CLASSROOM: "bg-violet-100 text-violet-700" }

function toInputDate(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export default function AgendaPage() {
  const reduceMotion = useReducedMotion()
  const [month, setMonth] = useState(new Date(2026, 7, 1))
  const [selectedDay, setSelectedDay] = useState(26)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [googleConnected, setGoogleConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncWarning, setSyncWarning] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const loadEvents = useCallback(async () => {
    setLoading(true); setError(null)
    const from = new Date(month.getFullYear(), month.getMonth(), 1)
    const to = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    try {
      const response = await fetch(`/api/calendar/events?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`)
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error ?? "Não foi possível carregar a agenda.")
      setEvents(data.events ?? []); setGoogleConnected(Boolean(data.google?.connected)); setSyncWarning(data.syncError ?? null)
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a agenda.") }
    finally { setLoading(false) }
  }, [month])

  useEffect(() => {
    const task = window.setTimeout(() => void loadEvents(), 0)
    return () => window.clearTimeout(task)
  }, [loadEvents])

  const calendarDays = useMemo(() => {
    const year = month.getFullYear(), monthIndex = month.getMonth()
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    const mondayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7
    const previousDays = new Date(year, monthIndex, 0).getDate()
    return [...Array.from({ length: mondayOffset }, (_, i) => ({ day: previousDays - mondayOffset + i + 1, muted: true })), ...Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, muted: false })), ...Array.from({ length: (7 - (mondayOffset + daysInMonth) % 7) % 7 }, (_, i) => ({ day: i + 1, muted: true }))]
  }, [month])
  const selectedEvents = events.filter((event) => new Date(event.startAt).getDate() === selectedDay)
  const monthLabel = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(month)

  function openCreate() { setEditingId(null); setForm({ ...emptyForm, startAt: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}T09:00` }); setFormOpen(true) }
  function openEdit(event: CalendarEvent) { setEditingId(event.id); setForm({ title: event.title, description: event.description ?? "", startAt: toInputDate(event.startAt), endAt: toInputDate(event.endAt), allDay: event.allDay, type: event.type, addToGoogle: event.syncedWithGoogle }); setFormOpen(true) }
  async function connectGoogle() { await authClient.linkSocial({ provider: "google", callbackURL: "/agenda", scopes: [...GOOGLE_RITIMU_SCOPES] }) }

  async function saveEvent(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(null)
    try {
      const payload = { ...form, startAt: new Date(form.startAt).toISOString(), endAt: form.endAt ? new Date(form.endAt).toISOString() : null }
      const response = await fetch(editingId ? `/api/calendar/events/${editingId}` : "/api/calendar/events", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error ?? "Não foi possível salvar o evento.")
      setFormOpen(false); await loadEvents()
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar o evento.") }
    finally { setSaving(false) }
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Excluir este evento?")) return
    const response = await fetch(`/api/calendar/events/${id}`, { method: "DELETE" })
    if (!response.ok) { const data = await response.json().catch(() => null); setError(data?.error ?? "Não foi possível excluir o evento."); return }
    await loadEvents()
  }

  return <main className="min-h-screen bg-[#f6f5f1] px-5 pb-32 pt-6 text-[#181817] sm:px-8">
    <div className="mx-auto w-full max-w-5xl">
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div><h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Minha agenda</h1><p className="mt-2 text-black/45">Aulas, estudos e compromissos em um só lugar.</p></div>
        <div className="flex flex-wrap items-center gap-2">{!googleConnected && <button onClick={connectGoogle} className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold transition hover:border-sky-300"><Cloud className="size-4 text-sky-500" />Conectar Google Calendar</button>}<button onClick={openCreate} className="flex items-center gap-2 rounded-full bg-[#181817] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"><Plus className="size-4" />Novo evento</button><button type="button" aria-label="Configurações da agenda" title="Configurações da agenda" className="grid size-11 place-items-center rounded-full border border-black/10 bg-white text-black/55 shadow-sm transition hover:-translate-y-0.5 hover:border-black/20 hover:text-black"><Settings className="size-[18px]" /></button></div>
      </motion.header>
      {(error || syncWarning) && <div className={`mb-7 rounded-2xl border px-5 py-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{error ?? syncWarning}</div>}
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.92fr)_minmax(300px,1fr)]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[620px] rounded-[28px] border border-black/[0.06] bg-white p-6 shadow-[0_16px_50px_rgba(30,30,20,0.04)] sm:p-7 lg:min-h-[666px]"
        >
          <div className="mb-7 flex items-center justify-between"><div><p className="text-sm font-medium text-black/35">Calendário</p><h2 className="mt-1 text-2xl font-semibold capitalize">{monthLabel}</h2></div><div className="flex gap-2"><button aria-label="Mês anterior" onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); setSelectedDay(1) }} className="grid size-10 place-items-center rounded-full border border-black/10 hover:bg-black hover:text-white"><ChevronLeft className="size-4" /></button><button aria-label="Próximo mês" onClick={() => { setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); setSelectedDay(1) }} className="grid size-10 place-items-center rounded-full border border-black/10 hover:bg-black hover:text-white"><ChevronRight className="size-4" /></button></div></div>
          <div className="grid grid-cols-7 border-b border-black/[0.06] pb-3">{weekDays.map((day) => <span key={day} className="text-center text-[10px] font-bold tracking-widest text-black/30 sm:text-xs">{day}</span>)}</div>
          <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">{calendarDays.map((date, index) => { const hasEvents = !date.muted && events.some((event) => new Date(event.startAt).getDate() === date.day); const active = !date.muted && date.day === selectedDay; return <button key={`${date.day}-${index}`} disabled={date.muted} onClick={() => setSelectedDay(date.day)} className={`relative flex aspect-square min-h-11 items-center justify-center rounded-2xl text-sm font-medium transition sm:min-h-16 ${active ? "bg-[#50d05c] text-white shadow-[0_10px_25px_rgba(80,208,92,.28)]" : date.muted ? "text-black/15" : "hover:bg-[#f3f4ef]"}`}>{date.day}{hasEvents && <span className={`absolute bottom-2 size-1 rounded-full ${active ? "bg-white" : "bg-[#50d05c]"}`} />}</button> })}</div>
        </motion.div>
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, x: 28, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-[620px] rounded-[28px] bg-[#171717] p-6 text-white sm:p-7 lg:min-h-[666px]"
        >
          <div className="mb-7 flex items-start justify-between"><div><p className="text-sm font-medium capitalize text-white/45">{monthLabel}</p><h2 className="mt-1 text-2xl font-semibold">Dia {selectedDay}</h2></div><div className="grid size-11 place-items-center rounded-2xl bg-white/10"><CalendarDays className="size-5 text-[#6be075]" /></div></div>
          {loading ? <div className="grid min-h-64 place-items-center"><LoaderCircle className="size-7 animate-spin text-[#50d05c]" /></div> : <div className="space-y-3">{selectedEvents.length ? selectedEvents.map((item) => <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><div className="flex gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10"><BookOpen className="size-5 text-[#6be075]" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="text-xs text-white/45">{item.allDay ? "Dia inteiro" : new Date(item.startAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${sourceClasses[item.source]}`}>{sourceLabels[item.source]}</span></div><h3 className="mt-1 truncate font-semibold">{item.title}</h3><div className="mt-2 flex gap-2"><button onClick={() => openEdit(item)} className="text-white/40 hover:text-white" aria-label="Editar"><Pencil className="size-4" /></button><button onClick={() => deleteEvent(item.id)} className="text-white/40 hover:text-red-400" aria-label="Excluir"><Trash2 className="size-4" /></button></div></div></div></article>) : <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 text-center"><CalendarDays className="mb-4 size-6 text-white/30" /><p className="font-semibold">Dia livre por aqui</p><button onClick={openCreate} className="mt-3 text-sm font-semibold text-[#6be075]">Adicionar evento</button></div>}</div>}
        </motion.aside>
      </section>
    </div>
    {formOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"><form onSubmit={saveEvent} className="max-h-[92vh] w-full max-w-lg overflow-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-semibold text-[#50b85a]">AGENDA</p><h2 className="text-2xl font-semibold">{editingId ? "Editar evento" : "Novo evento"}</h2></div><button type="button" onClick={() => setFormOpen(false)} className="grid size-9 place-items-center rounded-full bg-black/5"><X className="size-4" /></button></div><div className="space-y-4"><label className="block text-sm font-semibold">Título<input required maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-[#50d05c]" /></label><label className="block text-sm font-semibold">Descrição<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 min-h-20 w-full rounded-xl border border-black/10 px-4 py-3 font-normal outline-none focus:border-[#50d05c]" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Início<input required type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-3 font-normal" /></label><label className="text-sm font-semibold">Fim<input type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-3 font-normal" /></label></div><label className="block text-sm font-semibold">Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="mt-1.5 w-full rounded-xl border border-black/10 px-4 py-3 font-normal"><option value="STUDY">Estudo</option><option value="CLASS">Aula</option><option value="EXAM">Prova</option><option value="ASSIGNMENT">Atividade</option><option value="PERSONAL">Pessoal</option><option value="OTHER">Outro</option></select></label><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} className="size-4 accent-[#50d05c]" />Dia inteiro</label>{!editingId && <label className={`flex items-center gap-3 text-sm ${!googleConnected ? "text-black/35" : ""}`}><input type="checkbox" disabled={!googleConnected} checked={form.addToGoogle} onChange={(e) => setForm({ ...form, addToGoogle: e.target.checked })} className="size-4 accent-[#50d05c]" />Adicionar ao Google Calendar</label>}</div><button disabled={saving} className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#50d05c] py-3.5 font-semibold text-white disabled:opacity-60">{saving && <LoaderCircle className="size-4 animate-spin" />}{saving ? "Salvando..." : "Salvar evento"}</button></form></div>}
    <Sidebar />
  </main>
}
