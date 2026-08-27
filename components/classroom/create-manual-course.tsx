"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { BookOpen, Check, LoaderCircle, Plus, X } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

export function CreateManualCourse({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [section, setSection] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    setError(null)
    const response = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, section }) })
    const data = await response.json().catch(() => null)
    setSaving(false)
    if (!response.ok) return setError(data?.error ?? "Não foi possível criar a matéria.")
    setOpen(false)
    setName("")
    setSection("")
    router.refresh()
  }

  return <>
    <motion.button type="button" onClick={() => setOpen(true)} whileHover={reduceMotion ? undefined : { y: -3 }} className={compact ? "mt-5 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white" : "flex min-h-[220px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-transparent p-6 text-center transition hover:border-[#50D05C]/50 hover:bg-[#50D05C]/[.04]"}>
      <span className="flex size-12 items-center justify-center rounded-full bg-lime-400/20"><Plus className="size-6 text-lime-600" /></span>
      <span className="mt-4 font-semibold">Adicionar matéria</span>
      {!compact && <span className="mt-1 text-sm font-normal text-black/45">Crie estudos pessoais fora da faculdade.</span>}
    </motion.button>
    {typeof document !== "undefined" && createPortal(<AnimatePresence>
      {open && <motion.div className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-5 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#45B950]">Nova matéria</p><h2 className="mt-1 text-2xl font-bold">O que você quer estudar?</h2></div><button onClick={() => setOpen(false)} className="rounded-full bg-black/[.05] p-2 transition hover:bg-red-50 hover:text-red-600"><X className="size-5" /></button></div>
          <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-black/40">Nome<input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Estudos de GitHub" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-black/[.025] px-4 text-sm font-medium outline-none focus:border-[#50D05C]/50 focus:ring-4 focus:ring-[#50D05C]/10" /></label>
          <label className="mt-4 block text-xs font-bold uppercase tracking-wider text-black/40">Descrição <span className="font-normal normal-case">(opcional)</span><input value={section} onChange={(event) => setSection(event.target.value)} placeholder="Ex.: Desenvolvimento e versionamento" className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-black/[.025] px-4 text-sm outline-none focus:border-[#50D05C]/50 focus:ring-4 focus:ring-[#50D05C]/10" /></label>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <button disabled={saving || name.trim().length < 2} onClick={() => void save()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#50D05C] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#45C452] disabled:opacity-40">{saving ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}{saving ? "Criando..." : "Criar matéria"}</button>
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-black/[.025] p-3 text-xs text-black/45"><BookOpen className="size-4 text-[#45B950]" />Ela também aparecerá no seu plano de estudos.</div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>, document.body)}
  </>
}
