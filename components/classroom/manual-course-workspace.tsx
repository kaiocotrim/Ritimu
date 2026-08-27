"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Check, LoaderCircle, Plus, Settings, Trash2, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { createPortal } from "react-dom"

type Content = { id: string; title: string; description: string | null; studied: boolean; estimatedMinutes: number }

export function ManualCourseWorkspace({ courseId, initialContents }: { courseId: string; initialContents: Content[] }) {
  const router = useRouter()
  const [contents, setContents] = useState(initialContents)
  const [menu, setMenu] = useState(false)
  const [form, setForm] = useState(false)
  const [confirmCourseDelete, setConfirmCourseDelete] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  async function add() {
    setSaving(true)
    const response = await fetch("/api/study-plan/contents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, title, description, importance: 3, estimatedMinutes: 40, studied: false }) })
    const data = await response.json().catch(() => null)
    setSaving(false)
    if (!response.ok) return
    setContents((current) => [...current, data.content])
    setTitle(""); setDescription(""); setForm(false); setMenu(false)
  }

  async function toggle(content: Content) {
    const next = !content.studied
    setContents((current) => current.map((item) => item.id === content.id ? { ...item, studied: next } : item))
    await fetch(`/api/study-plan/contents/${content.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studied: next }) })
  }

  async function removeContent(id: string) {
    setContents((current) => current.filter((item) => item.id !== id))
    await fetch(`/api/study-plan/contents/${id}`, { method: "DELETE" })
  }

  async function removeCourse() {
    const response = await fetch(`/api/courses/${courseId}`, { method: "DELETE" })
    if (response.ok) router.push("/disciplinas")
  }

  return <div className="space-y-4">
    <div className="relative flex items-center justify-between">
      <div><h2 className="text-xl font-semibold">Conteúdos</h2><p className="mt-1 text-sm text-black/45">{contents.length} {contents.length === 1 ? "conteúdo" : "conteúdos"}</p></div>
      <button onClick={() => setMenu((current) => !current)} aria-label="Configurar matéria" className={`grid size-11 place-items-center rounded-full border transition ${menu ? "border-[#50D05C]/40 bg-[#50D05C] text-black" : "border-black/10 bg-white hover:border-black/20"}`}><Settings className={`size-5 transition-transform ${menu ? "rotate-90" : ""}`} /></button>
      <AnimatePresence>{menu && <motion.div initial={{ opacity: 0, y: -5, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} className="absolute right-0 top-14 z-20 w-56 rounded-2xl border border-black/10 bg-white p-2 shadow-xl"><button onClick={() => setForm(true)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-black/[.04]"><Plus className="size-4 text-[#45B950]" />Adicionar conteúdo</button><button onClick={() => { setMenu(false); setConfirmCourseDelete(true) }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="size-4" />Excluir matéria</button></motion.div>}</AnimatePresence>
    </div>
    <AnimatePresence initial={false}>
      {contents.map((content) => <motion.article layout key={content.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .96 }} className={`flex items-start gap-4 rounded-3xl border bg-white p-5 ${content.studied ? "border-[#50D05C]/25 opacity-60" : "border-black/5"}`}><button onClick={() => void toggle(content)} className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border ${content.studied ? "border-[#50D05C] bg-[#50D05C] text-white" : "border-black/20"}`}>{content.studied && <Check className="size-3.5" />}</button><div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[#50D05C]/15 text-[#2F8F3A]"><BookOpen className="size-4" /></div><div className="min-w-0 flex-1"><h3 className={`font-semibold ${content.studied ? "line-through" : ""}`}>{content.title}</h3>{content.description && <p className="mt-1 text-sm text-black/45">{content.description}</p>}<p className="mt-2 text-xs text-black/35">{content.estimatedMinutes} min estimados</p></div><button onClick={() => void removeContent(content.id)} className="rounded-full p-2 text-black/25 transition hover:bg-red-50 hover:text-red-600"><Trash2 className="size-4" /></button></motion.article>)}
    </AnimatePresence>
    {!contents.length && <button onClick={() => setForm(true)} className="flex w-full flex-col items-center rounded-3xl border border-dashed border-black/15 bg-white/50 p-10 text-black/45 transition hover:border-[#50D05C]/40 hover:text-black"><Plus className="size-6 text-[#45B950]" /><span className="mt-3 font-semibold">Adicionar primeiro conteúdo</span></button>}
    {typeof document !== "undefined" && createPortal(<AnimatePresence>{form && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-5 backdrop-blur-sm"><motion.div initial={{ y: 16, scale: .97 }} animate={{ y: 0, scale: 1 }} className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"><div className="flex justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#45B950]">Novo conteúdo</p><h2 className="mt-1 text-2xl font-bold">Adicionar estudo</h2></div><button onClick={() => setForm(false)} className="rounded-full bg-black/5 p-2"><X className="size-5" /></button></div><input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Git básico e commits" className="mt-6 h-12 w-full rounded-2xl border border-black/10 px-4 outline-none focus:border-[#50D05C]" /><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Descrição opcional" className="mt-3 min-h-28 w-full resize-none rounded-2xl border border-black/10 p-4 outline-none focus:border-[#50D05C]" /><button disabled={saving || title.trim().length < 2} onClick={() => void add()} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#50D05C] py-3 font-semibold disabled:opacity-40">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}Adicionar conteúdo</button></motion.div></motion.div>}</AnimatePresence>, document.body)}
    {typeof document !== "undefined" && createPortal(<AnimatePresence>{confirmCourseDelete && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] grid place-items-center bg-black/55 p-5 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirmCourseDelete(false) }}><motion.div initial={{ opacity: 0, y: 14, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }} className="w-full max-w-sm rounded-[28px] bg-[#12151D] p-6 text-white shadow-2xl ring-1 ring-white/10"><div className="grid size-11 place-items-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-400/15"><Trash2 className="size-5" /></div><h2 className="mt-5 text-xl font-bold">Excluir matéria?</h2><p className="mt-2 text-sm leading-relaxed text-white/50">A matéria e todos os conteúdos adicionados serão excluídos. Essa ação não poderá ser desfeita.</p><div className="mt-6 flex justify-end gap-2"><button onClick={() => setConfirmCourseDelete(false)} className="rounded-full px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/[.07] hover:text-white">Cancelar</button><button onClick={() => void removeCourse()} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(220,38,38,.22)] transition hover:bg-red-500">Excluir matéria</button></div></motion.div></motion.div>}</AnimatePresence>, document.body)}
  </div>
}
