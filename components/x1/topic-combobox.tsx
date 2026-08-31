"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Check, LoaderCircle, Search, X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

export type TopicOption = { id: string; name: string; slug: string; subtopics: string[] }

export function TopicCombobox({ value, onChange }: { value: TopicOption | null; onChange: (topic: TopicOption | null) => void }) {
  const listId = useId(), requestId = useRef(0)
  const [query, setQuery] = useState(value?.name ?? ""), [results, setResults] = useState<TopicOption[]>([])
  const [open, setOpen] = useState(false), [loading, setLoading] = useState(false), [active, setActive] = useState(0)
  const [confirmation, setConfirmation] = useState<{ original: string; suggestion: string } | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!open) return
    const current = ++requestId.current
    const timeout = window.setTimeout(async () => {
      setLoading(true)
      const response = await fetch(`/api/x1/topics?q=${encodeURIComponent(query)}`, { cache: "no-store" })
      const data = await response.json().catch(() => null)
      if (current !== requestId.current) return
      setResults(response.ok ? data?.topics ?? [] : [])
      setActive(0); setLoading(false)
    }, 350)
    return () => window.clearTimeout(timeout)
  }, [open, query])

  async function create(choice?: "SUGGESTION" | "ORIGINAL") {
    setLoading(true); setError("")
    const response = await fetch("/api/x1/topics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: confirmation?.original ?? query, choice }) })
    const data = await response.json().catch(() => null)
    setLoading(false)
    if (!response.ok) return setError(data?.error ?? "Não foi possível criar o tema.")
    if (data.confirmationRequired) return setConfirmation({ original: data.original, suggestion: data.suggestion })
    select(data.topic)
  }

  function select(topic: TopicOption) { onChange(topic); setQuery(topic.name); setOpen(false); setConfirmation(null); setError("") }
  const customAvailable = query.trim().length >= 3 && !results.some((topic) => topic.name.toLocaleLowerCase("pt-BR") === query.trim().toLocaleLowerCase("pt-BR"))
  const count = results.length + (customAvailable ? 1 : 0)

  return <div className="relative">
    <div className={`flex items-center rounded-xl border bg-[#fcfcfb] transition ${open ? "border-[#76d842] ring-4 ring-[#76d842]/10" : "border-black/[.09]"}`}><Search className="ml-4 size-4 text-black/30" /><input role="combobox" aria-expanded={open} aria-controls={listId} aria-autocomplete="list" aria-activedescendant={open && count ? `${listId}-${active}` : undefined} value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); onChange(null); setOpen(true) }} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setActive((index) => Math.min(count - 1, index + 1)) } if (event.key === "ArrowUp") { event.preventDefault(); setActive((index) => Math.max(0, index - 1)) } if (event.key === "Escape") setOpen(false); if (event.key === "Enter") { event.preventDefault(); if (active < results.length && results[active]) select(results[active]); else if (customAvailable) void create() } }} placeholder="Digite ou pesquise um tema..." className="h-12 min-w-0 flex-1 bg-transparent px-3 text-xs font-semibold text-black outline-none placeholder:text-black/25" />{loading ? <LoaderCircle className="mr-4 size-4 animate-spin text-[#63c735]" /> : query && <button type="button" aria-label="Limpar tema" onClick={() => { setQuery(""); onChange(null); setOpen(true) }} className="mr-3 cursor-pointer rounded-full p-1 text-black/35 hover:bg-black/5 hover:text-black"><X className="size-4" /></button>}{value && <Check className="mr-4 size-4 text-[#5fc332]" />}</div>
    <AnimatePresence>{open && <motion.div id={listId} role="listbox" initial={{ opacity: 0, y: -4, scale: .99 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -3, scale: .99 }} transition={{ duration: .16 }} className="absolute z-30 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-black/[.08] bg-white p-1.5 shadow-[0_14px_35px_rgba(0,0,0,.12)] [scrollbar-color:#b8b8b8_transparent] [scrollbar-width:thin]">{results.map((topic, index) => <button id={`${listId}-${index}`} role="option" aria-selected={active === index} key={topic.id} type="button" onMouseEnter={() => setActive(index)} onClick={() => select(topic)} className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-xs font-semibold transition-colors ${active === index ? "bg-[#e8f8e2] text-[#2d7f19]" : "text-black/65 hover:bg-black/[.04] hover:text-black"}`}><Highlighted text={topic.name} query={query} /></button>)}{!loading && !results.length && <p className="px-3 py-3 text-xs text-black/40">Nenhum tema encontrado para “{query}”.</p>}{customAvailable && <button id={`${listId}-${results.length}`} role="option" aria-selected={active === results.length} type="button" onMouseEnter={() => setActive(results.length)} onClick={() => void create()} className={`w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-xs font-bold transition-colors ${active === results.length ? "bg-[#e8f8e2] text-[#2d7f19]" : "text-[#45a629] hover:bg-black/[.04]"}`}>+ Criar tema “{query.trim()}”</button>}</motion.div>}</AnimatePresence>
    {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
    <AnimatePresence>{confirmation && <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><motion.div initial={{ scale: .95, y: 14 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center text-black"><p className="text-sm font-bold text-black/45">Encontramos uma sugestão:</p><h3 className="mt-3 text-2xl font-black">“{confirmation.suggestion}”</h3><p className="mt-2 text-sm text-black/45">Seu texto: “{confirmation.original}”</p><div className="mt-6 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => void create("SUGGESTION")} className="cursor-pointer rounded-full bg-[#50D05C] px-4 py-3 text-sm font-bold">Usar sugestão</button><button type="button" onClick={() => void create("ORIGINAL")} className="cursor-pointer rounded-full border border-black/10 px-4 py-3 text-sm font-bold">Manter meu texto</button></div></motion.div></motion.div>}</AnimatePresence>
  </div>
}

function Highlighted({ text, query }: { text: string; query: string }) {
  const index = text.toLocaleLowerCase("pt-BR").indexOf(query.trim().toLocaleLowerCase("pt-BR"))
  if (index < 0 || !query.trim()) return text
  return <>{text.slice(0, index)}<mark className="bg-transparent font-black text-inherit underline decoration-current/40">{text.slice(index, index + query.trim().length)}</mark>{text.slice(index + query.trim().length)}</>
}
