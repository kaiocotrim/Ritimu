"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react"
import Image from "next/image"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  BookOpen, BriefcaseBusiness, CalendarDays, Check, ChevronLeft, ChevronRight,
  Clock3, Coffee, Dumbbell, FlaskConical, LoaderCircle, Plus, Repeat2,
  Info, Pencil, Sparkles, Target, Trash2, X,
} from "lucide-react"

import { SmoothMoonwalk } from "@/components/animations/Smooth-Moonwalk/page"
import { StudyPlannerSkeleton } from "@/components/study-plan/study-planner-skeleton"
import { getDayCompletionStatus, type DayCompletionStatus } from "@/lib/study-plan/day-status"

type View = "WEEKLY" | "MONTHLY"
type Kind = "STUDY" | "GYM" | "WORK" | "READING" | "REVIEW" | "EXAM" | "BREAK" | "OTHER"
type Course = { id: string; name: string }
type PlanEvent = { id: string; title: string; startAt: string; endAt: string | null; status: "PENDING" | "COMPLETED" | "CANCELED"; routineType: Kind; recurrence: "NONE" | "WEEKLY" | "CUSTOM"; recurrenceDays: number[]; recurrenceUntil: string | null; studySession: { courseId: string | null; subjectName: string | null } | null; dayCompletions: { occurrenceDate: string }[] }
type Occurrence = Omit<PlanEvent, "startAt" | "endAt"> & { startAt: Date; endAt: Date | null; source: PlanEvent }

const labels = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"]
const kinds: { value: Kind; label: string; icon: typeof BookOpen; color: string }[] = [
  { value: "STUDY", label: "Estudo", icon: BookOpen, color: "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/10" },
  { value: "GYM", label: "Academia", icon: Dumbbell, color: "bg-orange-400/15 text-orange-300 ring-1 ring-orange-300/10" },
  { value: "WORK", label: "Trabalho", icon: BriefcaseBusiness, color: "bg-sky-400/15 text-sky-300 ring-1 ring-sky-300/10" },
  { value: "READING", label: "Leitura", icon: BookOpen, color: "bg-violet-400/15 text-violet-300 ring-1 ring-violet-300/10" },
  { value: "REVIEW", label: "Revisão", icon: Repeat2, color: "bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/10" },
  { value: "EXAM", label: "Prova", icon: FlaskConical, color: "bg-rose-400/15 text-rose-300 ring-1 ring-rose-300/10" },
  { value: "BREAK", label: "Intervalo", icon: Coffee, color: "bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-200/10" },
  { value: "OTHER", label: "Outro", icon: Plus, color: "bg-white/[.08] text-white/70 ring-1 ring-white/[.06]" },
]

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const addDays = (date: Date, amount: number) => { const next = new Date(date); next.setDate(next.getDate() + amount); return next }
const weekStart = (date: Date) => addDays(dayStart(date), -((date.getDay() + 6) % 7))
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
const sameDay = (a: Date, b: Date) => dateKey(a) === dateKey(b)
const meta = (kind: Kind) => kinds.find((item) => item.value === kind) ?? kinds[7]
const clock = (date: Date | null) => date?.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) ?? ""
const dayStatusClass: Record<DayCompletionStatus, string> = {
  PERFECT: "bg-[linear-gradient(180deg,rgba(80,208,92,0.16),rgba(80,208,92,0.06))] shadow-[inset_0_0_0_1px_rgba(80,208,92,0.32),inset_0_18px_45px_rgba(80,208,92,0.05)]",
  PARTIAL: "bg-[linear-gradient(180deg,rgba(245,181,54,0.14),rgba(245,181,54,0.05))] shadow-[inset_0_0_0_1px_rgba(245,181,54,0.28)]",
  MISSED: "bg-[linear-gradient(180deg,rgba(239,91,91,0.14),rgba(239,91,91,0.05))] shadow-[inset_0_0_0_1px_rgba(239,91,91,0.28)]",
  NEUTRAL: "",
}

export function StudyPlanner({ initialCourses, theme = "SPACE" }: { initialCourses: Course[]; theme?: "SPACE" | "LIGHT" }) {
  const reduceMotion = useReducedMotion()
  const [view, setView] = useState<View>("WEEKLY")
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [anchor, setAnchor] = useState(new Date())
  const [events, setEvents] = useState<PlanEvent[]>([])
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [calendarFilter, setCalendarFilter] = useState("ALL")
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ event: PlanEvent | null; date: Date } | null>(null)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [contextMenu, setContextMenu] = useState<{ event: Occurrence; x: number; y: number } | null>(null)
  const hasLoaded = useRef(false)

  const range = useMemo(() => view === "WEEKLY"
    ? { from: weekStart(anchor), to: addDays(weekStart(anchor), 7) }
    : { from: new Date(anchor.getFullYear(), anchor.getMonth(), 1), to: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1) }, [anchor, view])

  const load = useCallback(async () => {
    const initialLoad = !hasLoaded.current
    if (initialLoad) setLoading(true)
    const response = await fetch(`/api/study-plan/planner?from=${encodeURIComponent(range.from.toISOString())}&to=${encodeURIComponent(range.to.toISOString())}`)
    const data = await response.json().catch(() => null)
    if (response.ok) {
      setEvents(data.events ?? [])
      if (data.courses?.length) setCourses(data.courses)
      setConfigured(Boolean(data.configured))
      if (initialLoad && (data.view === "WEEKLY" || data.view === "MONTHLY")) setView(data.view)
    } else setError(data?.error ?? "Não foi possível carregar seu plano.")
    hasLoaded.current = true
    setLoading(false)
  }, [range.from, range.to])
  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timeout)
  }, [load])
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") close() }
    window.addEventListener("click", close)
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    document.addEventListener("keydown", keydown)
    return () => { window.removeEventListener("click", close); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); document.removeEventListener("keydown", keydown) }
  }, [contextMenu])

  const visible = useMemo(() => occurrences(events, range.from, range.to), [events, range])
  const calendarEvents = useMemo(() => calendarFilter === "ALL" ? visible : calendarFilter.startsWith("TITLE:") ? visible.filter((event) => event.title === calendarFilter.slice(6)) : visible.filter((event) => event.routineType === calendarFilter), [calendarFilter, visible])
  const eventTitles = useMemo(() => Array.from(new Set(visible.map((event) => event.title))).sort((a, b) => a.localeCompare(b, "pt-BR")), [visible])
  const completed = visible.filter((event) => event.status === "COMPLETED").length
  const minutes = visible.reduce((sum, event) => sum + Math.max(0, ((event.endAt?.getTime() ?? event.startAt.getTime()) - event.startAt.getTime()) / 60000), 0)
  const studyDays = new Set(visible.filter((event) => event.routineType === "STUDY").map((event) => dateKey(event.startAt))).size
  const progress = visible.length ? Math.round(completed / visible.length * 100) : 0

  async function selectView(next: View) {
    if (configured && next === view) return
    const previous = view
    setView(next)
    setBusy(true)
    const response = await fetch("/api/study-plan/planner", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ view: next }) })
    setBusy(false)
    if (!response.ok) setView(previous)
    if (response.ok) {
      setConfigured(true)
    } else setError("Não foi possível alterar a visualização do plano.")
  }

  async function deleteSelectedEvents(ids: string[]) {
    if (!await confirmDelete(ids.length)) return
    setBusy(true)
    setError(null)
    try {
      const responses = await Promise.all(ids.map(async (id) => {
        const response = await fetch(`/api/study-plan/events/${id}`, { method: "DELETE" })
        const data = await response.json().catch(() => null)
        if (!response.ok) throw new Error(data?.error ?? "Não foi possível excluir o evento.")
        return data as { warning?: string | null }
      }))
      const warning = responses.find((item) => item.warning)?.warning
      if (warning) setError(warning)
      setSelectedDay(null)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível excluir o evento.")
    } finally {
      setBusy(false)
    }
  }

  function openContextMenu(event: ReactMouseEvent, item: Occurrence) {
    event.preventDefault()
    event.stopPropagation()
    window.dispatchEvent(new Event("study-plan-context-menu-open"))
    const width = 230, height = 164, margin = 12
    setContextMenu({ event: item, x: Math.min(event.clientX, window.innerWidth - width - margin), y: Math.min(event.clientY, window.innerHeight - height - margin) })
  }

  if (configured === null && loading) return <Loading />
  if (configured === false) return <Onboarding busy={busy} onChoose={selectView} />

  const period = view === "WEEKLY"
    ? `${range.from.getDate()} – ${addDays(range.to, -1).getDate()} ${new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(addDays(range.to, -1))}`
    : new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(anchor)

  return <motion.div
    className={`${theme === "SPACE" ? "study-plan-black-theme" : ""} mx-auto max-w-5xl text-[#171717]`}
    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    <header className={`mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between ${theme === "SPACE" ? "text-white" : "text-[#171717]"}`}>
      <div><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Meu plano</h1><div className="mt-3 flex items-center gap-1 text-sm font-semibold capitalize text-white/55"><NavButton label="Período anterior" onClick={() => setAnchor(view === "WEEKLY" ? addDays(anchor, -7) : new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}><ChevronLeft /></NavButton><span className="min-w-40 text-center">{period}</span><NavButton label="Próximo período" onClick={() => setAnchor(view === "WEEKLY" ? addDays(anchor, 7) : new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}><ChevronRight /></NavButton></div></div>
      <div className="flex flex-wrap items-center gap-2"><div className="flex rounded-full bg-white p-1 ring-1 ring-black/[.06]">{(["WEEKLY", "MONTHLY"] as const).map((item) => <button key={item} disabled={busy} onClick={() => void selectView(item)} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 disabled:cursor-wait ${view === item ? "text-white" : "text-black/50"}`}>{view === item && <motion.span layoutId="planner-view-pill" className="absolute inset-0 rounded-full bg-black" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}<span className="relative z-10">{item === "WEEKLY" ? "Semana" : "Mês"}</span></button>)}</div><CalendarFilter value={calendarFilter} titles={eventTitles} onChange={setCalendarFilter} /><button onClick={() => setEditing({ event: null, date: new Date() })} className="planner-button bg-[#50D05C]"><Plus className="size-4" /> Adicionar evento</button></div>
    </header>
    {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_260px]">
      <section className="rounded-[28px] bg-white p-5 ring-1 ring-black/[.04] sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="font-semibold"><span className="text-[#45B950]">{visible.length} sessões</span> <span className="text-black/25">•</span> {duration(minutes)} planejadas <span className="text-black/25">•</span> {studyDays} dias de estudo</p><span className="text-sm font-bold">{progress}% concluído</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-black/[.06]"><div className="h-full rounded-full bg-[#50D05C] transition-all" style={{ width: `${progress}%` }} /></div><div className="mt-4 grid grid-cols-3 gap-3 text-xs text-black/45"><Stat icon={Target} value={visible.length} label="planejadas" /><Stat icon={Clock3} value={duration(minutes)} label="de rotina" /><Stat icon={Check} value={completed} label="concluídas" /></div></section>
      <section className="relative flex min-h-36 overflow-hidden rounded-[28px] bg-[#12141B] px-5 py-4 text-white ring-1 ring-white/10">
        <Image src="/palco.png" alt="" fill sizes="260px" className="object-cover object-[68%_center]" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12141B] via-[#12141B]/90 to-[#12141B]/10" />
        <div className="relative z-10 max-w-32 self-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#50D05C]">Boa sequência</p>
          <h2 className="mt-2 text-xl font-bold leading-tight">Mantenha o ritmo.</h2>
          <p className="mt-1 text-xs leading-relaxed text-white/45">Um passo por sessão.</p>
        </div>
        <div className="absolute bottom-6 left-3/4 flex h-full w-32 -translate-x-1/2 items-end justify-center">
          <div className="relative z-10 scale-95 origin-bottom"><SmoothMoonwalk /></div>
        </div>
      </section>
    </div>
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={loading ? "loading" : `${view}-${range.from.toISOString()}`}
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -14, scale: 0.99, filter: "blur(4px)" }}
        transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      >
        {loading ? <Loading compact /> : view === "WEEKLY" ? <Week from={range.from} events={calendarEvents} onDay={(date) => setSelectedDay(date)} onEvent={(event) => setEditing({ event: event.source, date: event.startAt })} onContext={openContextMenu} /> : <Month anchor={anchor} events={calendarEvents} onDay={(date) => setSelectedDay(date)} onEvent={(event) => setEditing({ event: event.source, date: event.startAt })} onContext={openContextMenu} contextMenuOpen={Boolean(contextMenu)} />}
      </motion.div>
    </AnimatePresence>
    {selectedDay && <DayAgenda date={selectedDay} events={calendarEvents.filter((event) => sameDay(event.startAt, selectedDay))} onClose={() => setSelectedDay(null)} onAdd={() => { setSelectedDay(null); setEditing({ event: null, date: selectedDay }) }} onEvent={(event) => { setSelectedDay(null); setEditing({ event: event.source, date: event.startAt }) }} onDeleteSelected={deleteSelectedEvents} />}
    {editing && <Editor value={editing} courses={courses} busy={busy} setBusy={setBusy} setError={setError} onClose={() => setEditing(null)} onSaved={async () => { setEditing(null); await load() }} />}
    {contextMenu && <EventContextMenu value={contextMenu} onClose={() => setContextMenu(null)} onView={() => { setSelectedDay(contextMenu.event.startAt); setContextMenu(null) }} onEdit={() => { setEditing({ event: contextMenu.event.source, date: contextMenu.event.startAt }); setContextMenu(null) }} onDelete={() => { const id = contextMenu.event.id; setContextMenu(null); void deleteSelectedEvents([id]) }} />}
  </motion.div>
}

function occurrences(events: PlanEvent[], from: Date, to: Date) {
  const result: Occurrence[] = []
  for (const source of events) {
    const original = new Date(source.startAt), end = source.endAt ? new Date(source.endAt) : null, recurrenceLimit = source.recurrenceUntil ? new Date(source.recurrenceUntil) : null
    const statusFor = (date: Date) => source.dayCompletions.some((completion) => sameDay(new Date(completion.occurrenceDate), date)) ? "COMPLETED" as const : source.status
    if (source.recurrence === "NONE") { if (original >= from && original < to) result.push({ ...source, status: statusFor(original), startAt: original, endAt: end, source }); continue }
    const weekdays = source.recurrence === "WEEKLY" ? [original.getDay()] : source.recurrenceDays
    for (let date = dayStart(from); date < to; date = addDays(date, 1)) if (date >= dayStart(original) && (!recurrenceLimit || date <= recurrenceLimit) && weekdays.includes(date.getDay())) { const startAt = new Date(date); startAt.setHours(original.getHours(), original.getMinutes()); const span = (end?.getTime() ?? original.getTime()) - original.getTime(); result.push({ ...source, status: statusFor(startAt), startAt, endAt: new Date(startAt.getTime() + span), source }) }
  }
  return result.sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
}

function Week({ from, events, onDay, onEvent, onContext }: { from: Date; events: Occurrence[]; onDay: (date: Date) => void; onEvent: (event: Occurrence) => void; onContext: (mouseEvent: ReactMouseEvent, event: Occurrence) => void }) {
  return <section className="overflow-x-auto rounded-[28px] bg-white ring-1 ring-black/[.04]">
    <div className="grid min-w-[860px] grid-cols-7 divide-x divide-black/[.06]">
      {Array.from({ length: 7 }, (_, index) => {
        const date = addDays(from, index), items = events.filter((event) => sameDay(event.startAt, date))
        const dayStatus = getDayCompletionStatus(date, items)
        return <div key={dateKey(date)} data-day-status={dayStatus} className={`min-h-[430px] p-3 transition-colors ${dayStatusClass[dayStatus]}`}>
          <button onClick={() => onDay(date)} className={`mb-4 w-full rounded-2xl py-3 text-center ${sameDay(date, new Date()) ? "bg-black text-white" : "hover:bg-black/[.03]"}`}><span className="block text-[10px] font-bold tracking-widest opacity-45">{labels[date.getDay()]}</span><span className="mt-1 block text-xl font-bold">{date.getDate()}</span></button>
          <div className="space-y-2">
            <AnimatePresence initial={false}>{items.map((event) => <EventCard key={`${event.id}-${event.startAt.toISOString()}`} event={event} onClick={() => onEvent(event)} onContextMenu={(mouseEvent) => onContext(mouseEvent, event)} />)}</AnimatePresence>
            <button onClick={() => onDay(date)} className="flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-black/10 py-3 text-xs text-black/30 hover:text-black/60"><Plus className="size-3" /> adicionar</button>
          </div>
        </div>
      })}
    </div>
  </section>
}

function DayAgenda({ date, events, onClose, onAdd, onEvent, onDeleteSelected }: { date: Date; events: Occurrence[]; onClose: () => void; onAdd: () => void; onEvent: (event: Occurrence) => void; onDeleteSelected: (ids: string[]) => Promise<void> }) {
  const label = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(date)
  const [selected, setSelected] = useState<string[]>([])
  const multiple = events.length > 1

  return <Modal onClose={onClose} dark>
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#45B950]">Agenda do dia</p>
        <h2 className="mt-1 text-2xl font-bold capitalize">{label}</h2>
        <p className="mt-1 text-sm text-black/45">{events.length ? `${events.length} ${events.length === 1 ? "compromisso marcado" : "compromissos marcados"}` : "Nenhum compromisso marcado"}</p>
      </div>
      <Close onClick={onClose} dark />
    </div>
    <div className="space-y-3">
      {events.map((event) => {
        const item = meta(event.routineType), Icon = item.icon
        const checked = selected.includes(event.id)
        return <div key={`${event.id}-${event.startAt.toISOString()}`} className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition duration-200 hover:-translate-y-0.5 ${checked ? "border-[#50D05C]/45 bg-[#50D05C]/[.09]" : "border-black/[.06] bg-black/[.025] hover:border-[#50D05C]/35 hover:bg-[#50D05C]/[.07]"}`}>
          {multiple && <label className="grid size-8 shrink-0 cursor-pointer place-items-center"><input type="checkbox" checked={checked} onChange={() => setSelected((current) => current.includes(event.id) ? current.filter((id) => id !== event.id) : [...current, event.id])} className="size-4 accent-[#50D05C]" /><span className="sr-only">Selecionar {event.title}</span></label>}
          <button onClick={() => onEvent(event)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
          <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${item.color}`}><Icon className="size-5" /></span>
          <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{event.title}</strong><span className="mt-1 block text-xs text-black/45">{clock(event.startAt)} – {clock(event.endAt)} · {item.label}</span></span>
          <ChevronRight className="size-4 text-black/25 transition group-hover:translate-x-0.5 group-hover:text-[#45B950]" />
          </button>
        </div>
      })}
      {!events.length && <div className="rounded-2xl border border-dashed border-black/10 px-5 py-9 text-center"><CalendarDays className="mx-auto size-6 text-black/25" /><p className="mt-3 text-sm text-black/40">Este dia ainda está livre.</p></div>}
    </div>
    {selected.length > 0 && <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} onClick={() => void onDeleteSelected(selected)} className="planner-button mt-4 w-full bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="size-4" /> Excluir {selected.length} {selected.length === 1 ? "selecionado" : "selecionados"}</motion.button>}
    <button onClick={onAdd} className="planner-button mt-6 w-full bg-[#50D05C] text-black"><Plus className="size-4" /> Adicionar evento neste dia</button>
  </Modal>
}

function Month({ anchor, events, onDay, onEvent, onContext, contextMenuOpen }: { anchor: Date; events: Occurrence[]; onDay: (date: Date) => void; onEvent: (event: Occurrence) => void; onContext: (mouseEvent: ReactMouseEvent, event: Occurrence) => void; contextMenuOpen: boolean }) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1), grid = weekStart(first)
  return <section className="overflow-x-auto rounded-[28px] bg-white p-3 ring-1 ring-black/[.04]">
    <div className="grid min-w-[760px] grid-cols-7">
      {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((label) => <div key={label} className="py-3 text-center text-[10px] font-bold tracking-widest text-black/35">{label}</div>)}
      {Array.from({ length: 42 }, (_, index) => {
        const date = addDays(grid, index), items = events.filter((event) => sameDay(event.startAt, date))
        const dayStatus = getDayCompletionStatus(date, items)
        return <button key={dateKey(date)} data-day-status={dayStatus} onClick={() => onDay(date)} className={`group min-h-28 border-l border-t border-black/[.05] p-2 text-left transition-all duration-200 hover:z-[2] hover:shadow-[inset_0_0_0_1px_rgba(80,208,92,0.28),0_8px_24px_rgba(0,0,0,0.18)] ${dayStatusClass[dayStatus]} ${date.getMonth() !== anchor.getMonth() ? "opacity-35 hover:opacity-60" : ""}`}>
          <span className={`inline-grid size-7 place-items-center rounded-full text-xs font-bold transition-colors duration-200 ${sameDay(date, new Date()) ? "bg-black text-white" : "group-hover:text-[#50D05C]"}`}>{date.getDate()}</span>
          <div className="mt-1 space-y-1"><AnimatePresence initial={false}>{items.slice(0, 3).map((event) => <CalendarEventPill key={`${event.id}-${event.startAt.toISOString()}`} event={event} onClick={() => onEvent(event)} onContextMenu={(mouseEvent) => onContext(mouseEvent, event)} contextMenuOpen={contextMenuOpen} />)}</AnimatePresence>{items.length > 3 && <span className="block px-1 text-[10px] text-black/40">+{items.length - 3} eventos</span>}</div>
        </button>
      })}
    </div>
  </section>
}

function CalendarEventPill({ event, onClick, onContextMenu, contextMenuOpen }: { event: Occurrence; onClick: () => void; onContextMenu: (event: ReactMouseEvent) => void; contextMenuOpen: boolean }) {
  const item = meta(event.routineType)
  const [preview, setPreview] = useState<{ left: number; top: number; below: boolean } | null>(null)

  useEffect(() => {
    const closePreview = () => setPreview(null)
    window.addEventListener("study-plan-context-menu-open", closePreview)
    return () => window.removeEventListener("study-plan-context-menu-open", closePreview)
  }, [])

  function showPreview(target: HTMLElement) {
    if (contextMenuOpen) return
    const bounds = target.getBoundingClientRect()
    setPreview({
      left: Math.min(Math.max(bounds.left + bounds.width / 2, 112), window.innerWidth - 112),
      top: bounds.top < 100 ? bounds.bottom + 9 : bounds.top - 9,
      below: bounds.top < 100,
    })
  }

  return <motion.span layout initial={{ opacity: 0, scale: 0.86, y: 5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.82, y: -4 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="relative block" onMouseLeave={() => setPreview(null)}>
    <span onMouseEnter={(mouseEvent) => showPreview(mouseEvent.currentTarget)} onClick={(mouseEvent) => { mouseEvent.stopPropagation(); onClick() }} onContextMenu={(mouseEvent) => { setPreview(null); onContextMenu(mouseEvent) }} className={`block cursor-context-menu truncate rounded-lg px-2 py-1 text-[10px] font-semibold ${item.color}`}>{event.title}</span>
    {preview && !contextMenuOpen && createPortal(
      <motion.span
        className="pointer-events-none fixed z-[120] w-52 rounded-2xl border border-white/10 bg-[#202126]/95 p-3 text-left text-white shadow-[0_14px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl"
        style={{ left: preview.left, top: preview.top, transform: `translate(-50%, ${preview.below ? "0" : "-100%"})` }}
        initial={{ opacity: 0, y: preview.below ? -4 : 4, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <strong className="block truncate text-xs text-white">{event.title}</strong>
        <span className="mt-1.5 block text-[10px] text-white/55">{item.label} · {clock(event.startAt)} – {clock(event.endAt)}</span>
      </motion.span>,
      document.body
    )}
  </motion.span>
}

function EventCard({ event, onClick, onContextMenu }: { event: Occurrence; onClick: () => void; onContextMenu: (event: ReactMouseEvent) => void }) { const item = meta(event.routineType), Icon = item.icon; return <motion.button layout initial={{ opacity: 0, scale: 0.88, y: 7 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.82, y: -6 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} onClick={onClick} onContextMenu={onContextMenu} className={`w-full cursor-context-menu rounded-xl p-2.5 text-left transition hover:-translate-y-0.5 ${item.color} ${event.status === "COMPLETED" ? "opacity-45" : ""}`}><span className="flex items-center gap-1.5"><Icon className="size-3.5" /><strong className="truncate text-xs">{event.title}</strong></span><span className="mt-1 block text-[10px] opacity-65">{clock(event.startAt)} – {clock(event.endAt)}</span>{event.status === "COMPLETED" && <span className="mt-1 flex items-center gap-1 text-[9px] font-bold uppercase"><Check className="size-2.5" /> concluído</span>}</motion.button> }

function EventContextMenu({ value, onClose, onView, onEdit, onDelete }: { value: { event: Occurrence; x: number; y: number }; onClose: () => void; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  return createPortal(<motion.div role="menu" aria-label={`Ações para ${value.event.title}`} initial={{ opacity: 0, scale: .94, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} transition={{ duration: .16, ease: [0.22, 1, 0.36, 1] }} onClick={(event) => event.stopPropagation()} onContextMenu={(event) => event.preventDefault()} className="fixed z-[150] w-[230px] overflow-hidden rounded-xl border border-white/10 bg-[#202126]/95 p-1.5 text-white shadow-[0_18px_55px_rgba(0,0,0,.48)] backdrop-blur-xl" style={{ left: value.x, top: value.y }}>
    <div className="border-b border-white/[.08] px-3 py-2.5"><p className="truncate text-xs font-bold">{value.event.title}</p><p className="mt-0.5 text-[10px] text-white/40">{clock(value.event.startAt)} – {clock(value.event.endAt)}</p></div>
    <ContextAction icon={Info} label="Visualizar informações" onClick={onView} />
    <ContextAction icon={Pencil} label="Editar evento" onClick={onEdit} />
    <div className="my-1 h-px bg-white/[.08]" />
    <ContextAction icon={Trash2} label="Excluir evento" danger onClick={onDelete} />
    <button type="button" className="sr-only" onClick={onClose}>Fechar menu</button>
  </motion.div>, document.body)
}

function ContextAction({ icon: Icon, label, danger = false, onClick }: { icon: typeof Info; label: string; danger?: boolean; onClick: () => void }) {
  return <motion.button type="button" role="menuitem" onClick={onClick} whileHover={{ x: 2 }} whileTap={{ scale: .98 }} className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition ${danger ? "text-red-300 hover:bg-red-500/15" : "text-white/80 hover:bg-white/[.08] hover:text-white"}`}><Icon className="size-4 shrink-0 opacity-70" />{label}</motion.button>
}

function confirmDelete(count = 1) {
  return new Promise<boolean>((resolve) => {
    const overlay = document.createElement("div")
    overlay.className = "fixed inset-0 z-[100] grid place-items-center bg-black/55 p-5 backdrop-blur-sm"
    overlay.setAttribute("role", "alertdialog")
    overlay.setAttribute("aria-modal", "true")

    const panel = document.createElement("div")
    panel.className = "w-full max-w-sm rounded-[26px] bg-[#12151D] p-6 text-white shadow-2xl ring-1 ring-white/10"
    panel.innerHTML = '<div class="grid size-11 place-items-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-400/15"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="size-5"><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"/></svg></div><h2 class="mt-5 text-xl font-bold text-white">Excluir evento?</h2><p class="mt-2 text-sm leading-relaxed text-white/50">Este evento será removido do seu plano. Essa ação não poderá ser desfeita.</p><div class="mt-6 flex justify-end gap-2"><button data-cancel class="rounded-full px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/[.07] hover:text-white">Cancelar</button><button data-confirm class="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(220,38,38,0.22)] transition hover:bg-red-500">Excluir</button></div>'
    if (count > 1) {
      const title = panel.querySelector("h2")
      const description = panel.querySelector("p")
      if (title) title.textContent = `Excluir ${count} eventos?`
      if (description) description.textContent = "Os eventos selecionados serão removidos do seu plano. Essa ação não poderá ser desfeita."
    }
    overlay.appendChild(panel)
    document.body.appendChild(overlay)

    overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease-out" })
    panel.animate([{ opacity: 0, transform: "translateY(12px) scale(.97)" }, { opacity: 1, transform: "translateY(0) scale(1)" }], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" })

    const finish = (confirmed: boolean) => {
      overlay.remove()
      document.removeEventListener("keydown", onKeyDown)
      resolve(confirmed)
    }
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") finish(false) }
    panel.querySelector<HTMLButtonElement>("[data-cancel]")?.addEventListener("click", () => finish(false))
    panel.querySelector<HTMLButtonElement>("[data-confirm]")?.addEventListener("click", () => finish(true))
    overlay.addEventListener("mousedown", (event) => { if (event.target === overlay) finish(false) })
    document.addEventListener("keydown", onKeyDown)
    panel.querySelector<HTMLButtonElement>("[data-confirm]")?.focus()
  })
}

function Editor({ value, courses, busy, setBusy, setError, onClose, onSaved }: { value: { event: PlanEvent | null; date: Date }; courses: Course[]; busy: boolean; setBusy: (value: boolean) => void; setError: (value: string | null) => void; onClose: () => void; onSaved: () => Promise<void> }) {
  const current = value.event, start = current ? new Date(current.startAt) : value.date, end = current?.endAt ? new Date(current.endAt) : new Date(start.getTime() + 3600000)
  const occurrenceCompleted = current ? current.dayCompletions.some((completion) => sameDay(new Date(completion.occurrenceDate), value.date)) || (current.recurrence === "NONE" && current.status === "COMPLETED") : false
  const defaultRecurrenceUntil = new Date(start.getTime() + 12 * 7 * 24 * 60 * 60 * 1000)
  const [step, setStep] = useState(current ? 2 : 1), [kind, setKind] = useState<Kind>(current?.routineType ?? "STUDY"), [title, setTitle] = useState(current?.title ?? ""), [courseId, setCourseId] = useState(current?.studySession?.courseId ?? courses[0]?.id ?? ""), [date, setDate] = useState(dateKey(start)), [startTime, setStartTime] = useState(clock(start)), [endTime, setEndTime] = useState(clock(end)), [recurrence, setRecurrence] = useState(current?.recurrence ?? "NONE"), [days, setDays] = useState<number[]>(current?.recurrenceDays ?? []), [recurrenceUntil, setRecurrenceUntil] = useState<string>(dateKey(defaultRecurrenceUntil))
  const previousKind = useRef<Kind | null>(null)
  useEffect(() => {
    if (!current && step === 2 && previousKind.current !== kind) {
      previousKind.current = kind
      setTitle(meta(kind).label)
    }
  }, [current, kind, step])
  async function save() { setBusy(true); setError(null); const payload = { title, routineType: kind, courseId: kind === "STUDY" ? courseId : null, startAt: new Date(`${date}T${startTime}:00`).toISOString(), endAt: new Date(`${date}T${endTime}:00`).toISOString(), recurrence, recurrenceDays: days, recurrenceUntil: recurrence !== "NONE" ? new Date(`${recurrenceUntil}T23:59:59`).toISOString() : null }; const response = await fetch(current ? `/api/study-plan/events/${current.id}` : "/api/study-plan/events", { method: current ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const data = await response.json().catch(() => null); setBusy(false); if (!response.ok) return setError(data?.error ?? "Não foi possível salvar o evento."); await onSaved() }
  async function complete() { if (!current) return; setBusy(true); setError(null); try { const response = await fetch(`/api/study-plan/events/${current.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: !occurrenceCompleted, occurrenceDate: dateKey(value.date) }) }); const data = await response.json().catch(() => null); if (!response.ok) return setError(data?.error ?? "Não foi possível atualizar a atividade."); await onSaved() } catch { setError("Não foi possível atualizar a atividade.") } finally { setBusy(false) } }
  async function remove() { if (!current || !await confirmDelete()) return; setBusy(true); setError(null); try { const response = await fetch(`/api/study-plan/events/${current.id}`, { method: "DELETE" }); const data = await response.json().catch(() => null); if (!response.ok) return setError(data?.error ?? "Não foi possível excluir o evento."); if (data?.warning) setError(data.warning); await onSaved() } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível excluir o evento.") } finally { setBusy(false) } }
  return <Modal onClose={onClose}><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#45B950]">{current ? "Editar evento" : "Novo evento"}</p><h2 className="mt-1 text-2xl font-bold">{step === 1 ? "O que você quer adicionar?" : meta(kind).label}</h2></div><Close onClick={onClose} /></div>{step === 1 ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{kinds.map((item) => { const Icon = item.icon; return <button key={item.value} onClick={() => { setKind(item.value); setStep(2) }} className={`rounded-2xl p-4 text-left transition hover:-translate-y-0.5 ${item.color}`}><Icon className="mb-5 size-5" /><strong className="block text-sm">{item.label}</strong></button> })}</div> : <div className="space-y-5"><Field label={kind === "STUDY" ? "Objetivo" : "Título"}><input className="planner-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={kind === "STUDY" ? "Estudar modelo entidade-relacionamento" : meta(kind).label} autoFocus /></Field>{kind === "STUDY" && <Field label="Matéria"><select className="planner-input" value={courseId} onChange={(e) => setCourseId(e.target.value)}><option value="">Selecione uma matéria</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select>{!courses.length && <p className="mt-2 text-xs text-amber-700">Sincronize suas matérias em Disciplinas primeiro.</p>}</Field>}<div className="grid gap-4 sm:grid-cols-3"><Field label="Dia"><input className="planner-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field><Field label="Início"><input className="planner-input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></Field><Field label="Fim"><input className="planner-input" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></Field></div><Field label="Repetição"><select className="planner-input" value={recurrence} onChange={(e) => setRecurrence(e.target.value as typeof recurrence)}><option value="NONE">Não repetir</option><option value="WEEKLY">Toda semana</option><option value="CUSTOM">Personalizado</option></select></Field>{recurrence !== "NONE" && <Field label="Repetir até"><input className="planner-input" type="date" value={recurrenceUntil} onChange={(e) => setRecurrenceUntil(e.target.value)} min={date} /></Field>}{recurrence === "CUSTOM" && <div className="flex flex-wrap gap-2">{[1,2,3,4,5,6,0].map((day) => <button key={day} onClick={() => setDays((old) => old.includes(day) ? old.filter((item) => item !== day) : [...old, day])} className={`size-9 rounded-full text-xs font-bold ${days.includes(day) ? "bg-black text-white" : "bg-black/[.05]"}`}>{labels[day][0]}</button>)}</div>}<div className="flex flex-wrap justify-between gap-3 border-t border-black/[.06] pt-5"><div className="flex flex-wrap gap-2">{current && <button onClick={() => void complete()} className="planner-button bg-[#EAF8EC] text-[#2F8F3A]"><Check className="size-4" />{occurrenceCompleted ? "Reabrir" : "Concluir"}</button>}{current && <button onClick={() => void remove()} className="rounded-full bg-red-50 p-3 text-red-600"><Trash2 className="size-4" /></button>}</div><div className="flex gap-2">{!current && <button onClick={() => setStep(1)} className="rounded-full px-4 py-2 text-sm font-semibold">Voltar</button>}<button disabled={busy || !title || (kind === "STUDY" && !courseId)} onClick={() => void save()} className="planner-button bg-black text-white disabled:opacity-40">{busy ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}Salvar</button></div></div></div>}</Modal>
}

function Onboarding({ busy, onChoose }: { busy: boolean; onChoose: (view: View) => Promise<void> }) { return <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center"><div className="mb-10 max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full bg-[#EAF8EC] px-3 py-1.5 text-sm font-semibold text-[#2F8F3A]"><Sparkles className="size-4" /> Seu tempo, no seu ritmo</span><h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">Monte sua rotina</h1><p className="mt-4 text-lg leading-relaxed text-black/50">Organize seus estudos de acordo com sua semana e deixe o Ritimu ajudar você a manter o ritmo.</p></div><div className="grid gap-4 md:grid-cols-2"><WelcomeCard title="Plano semanal" description="Organize seus estudos e compromissos semana por semana." action="Configurar semana" busy={busy} onClick={() => void onChoose("WEEKLY")} /><WelcomeCard title="Plano mensal" description="Tenha uma visão geral dos seus estudos durante todo o mês." action="Configurar mês" busy={busy} onClick={() => void onChoose("MONTHLY")} /></div></div> }
function WelcomeCard({ title, description, action, busy, onClick }: { title: string; description: string; action: string; busy: boolean; onClick: () => void }) { return <article className="group rounded-[30px] bg-white p-7 text-[#171717] ring-1 ring-black/[.04] transition hover:-translate-y-1"><div className="grid size-12 place-items-center rounded-2xl bg-black text-[#50D05C]"><CalendarDays className="size-5" /></div><h2 className="mt-8 text-2xl font-bold">{title}</h2><p className="mt-2 min-h-12 text-black/45">{description}</p><button disabled={busy} onClick={onClick} className="mt-7 planner-button bg-[#50D05C]">{action}<ChevronRight className="size-4" /></button></article> }
function Modal({ children, onClose, dark = true }: { children: ReactNode; onClose: () => void; dark?: boolean }) {
  const reduceMotion = useReducedMotion()

  return <motion.div
    className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-sm sm:items-center sm:p-5"
    initial={reduceMotion ? false : { opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
    onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}
  >
    <motion.div
      className={`max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-[30px] p-5 shadow-2xl sm:rounded-[30px] sm:p-7 ${dark ? "planner-modal-dark bg-[#12151D] text-white ring-1 ring-white/10 [&_[class*='border-black']]:!border-white/10 [&_[class*='text-black']]:!text-white/55 [&_.planner-input]:!border-white/10 [&_.planner-input]:!bg-white/[.06] [&_.planner-input]:!text-white [&_button.rounded-2xl_svg]:text-white/75 [&_strong]:text-white" : "bg-white text-[#171717] [&_button.rounded-2xl_svg]:text-black/75 [&_strong]:text-black/75"}`}
      initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >{children}</motion.div>
  </motion.div>
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/40">{label}</span>{children}</label> }
function CalendarFilter({ value, titles, onChange }: { value: string; titles: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const options = [{ value: "ALL", label: "Todos" }, ...kinds.map((item) => ({ value: item.value, label: item.label })), ...titles.map((title) => ({ value: `TITLE:${title}`, label: title }))]
  const current = options.find((option) => option.value === value)?.label ?? "Todos"

  return <div className="relative z-40" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
    <button onClick={() => setOpen((currentOpen) => !currentOpen)} className={`flex h-11 items-center gap-2 rounded-full border px-4 text-xs font-semibold shadow-lg backdrop-blur-xl transition ${open ? "border-[#50D05C]/30 bg-[#181C24] text-white" : "border-white/10 bg-[#12151D]/90 text-white/55 hover:text-white"}`}>
      <span>Filtrar</span><strong className="text-white">{current}</strong><ChevronRight className={`size-3.5 transition-transform duration-200 ${open ? "rotate-[-90deg]" : "rotate-90"}`} />
    </button>
    <AnimatePresence>
      {open && <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }} className="absolute right-0 top-full w-48 pt-2">
        <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-[#181B23]/95 p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          {options.map((option) => <button key={option.value} onClick={() => { onChange(option.value); setOpen(false) }} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition ${value === option.value ? "bg-[#50D05C] text-[#071109]" : "text-white/65 hover:bg-white/[.07] hover:text-white"}`}><span>{option.label}</span>{value === option.value && <Check className="size-3.5" />}</button>)}
        </div>
      </motion.div>}
    </AnimatePresence>
  </div>
}
function NavButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) { return <button aria-label={label} onClick={onClick} className="rounded-full p-1.5 hover:bg-black/5 [&_svg]:size-4">{children}</button> }
function Close({ onClick, dark = true }: { onClick: () => void; dark?: boolean }) { return <button onClick={onClick} className={`rounded-full p-2 transition-colors duration-200 hover:bg-red-500/15 hover:text-red-400 ${dark ? "bg-white/[.07] text-white/65" : "bg-black/[.05] text-black/70"}`}><X className="size-5" /></button> }
function Stat({ icon: Icon, value, label }: { icon: typeof Target; value: string | number; label: string }) { return <div className="flex items-center gap-2"><Icon className="size-4 text-[#45B950]" /><span><strong className="text-black">{value}</strong> {label}</span></div> }
function Loading({ compact = false }: { compact?: boolean }) { return <StudyPlannerSkeleton compact={compact} /> }
function duration(value: number) { const minutes = Math.round(value); if (minutes < 60) return `${minutes}min`; return `${Math.floor(minutes / 60)}h${minutes % 60 ? String(minutes % 60).padStart(2, "0") : ""}` }
