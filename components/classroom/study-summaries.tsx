"use client"

import { useEffect, useState } from "react"
import { Link, LoaderCircle, Sparkles } from "lucide-react"

type Item = { id: string; title: string; kind: "coursework" | "material" }
type Summary = { id: string; sourceId: string; title: string; sourceType: string; content: { overview?: string; keyConcepts?: string[]; definitions?: string[]; importantPoints?: string[]; reviewQuestions?: string[] }; updatedAt: string }

export function StudySummaries({ courseId, items }: { courseId: string; items: Item[] }) {
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [open, setOpen] = useState<string | null>(null)
  const [manualTitle, setManualTitle] = useState("")
  const [manualUrl, setManualUrl] = useState("")

  useEffect(() => { void fetch(`/api/study-summaries?courseId=${encodeURIComponent(courseId)}`).then((response) => response.json()).then((data) => setSummaries(data.summaries ?? [])) }, [courseId])

  async function generate(item: Item) {
    setLoading(item.id); setError("")
    try {
      const response = await fetch("/api/study-summaries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, sourceId: item.id, sourceKind: item.kind }) })
      const data = await response.json() as { summary?: Summary; error?: string }
      if (!response.ok || !data.summary) throw new Error(data.error ?? "Não foi possível gerar o resumo")
      setSummaries((current) => [...current.filter((summary) => summary.sourceId !== item.id), data.summary!])
      setOpen(item.id)
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível gerar o resumo") } finally { setLoading(null) }
  }

  async function generateManual(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const sourceId = `manual:${manualUrl.trim()}`
    setLoading(sourceId); setError("")
    try {
      const response = await fetch("/api/study-summaries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, sourceId, sourceKind: "manual", sourceUrl: manualUrl.trim(), title: manualTitle.trim() }) })
      const data = await response.json() as { summary?: Summary; error?: string }
      if (!response.ok || !data.summary) throw new Error(data.error ?? "Não foi possível gerar o resumo")
      setSummaries((current) => [...current.filter((summary) => summary.sourceId !== sourceId), data.summary!])
      setOpen(sourceId)
      setManualTitle(""); setManualUrl("")
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível gerar o resumo") } finally { setLoading(null) }
  }

  return <section className="mt-10" aria-labelledby="summaries-title">
    <div className="mb-4 flex items-center gap-2"><Sparkles className="size-5 text-lime-600" /><h2 id="summaries-title" className="text-xl font-semibold">Resumos inteligentes</h2></div>
    {error && <p role="alert" className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!items.length && <p className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-6 text-sm text-black/45">Nenhum material disponível para gerar resumo.</p>}
    {items.length > 0 && <div className="grid gap-4 md:grid-cols-2">{items.map((item) => { const summary = summaries.find((value) => value.sourceId === item.id); return <article key={`${item.kind}-${item.id}`} className="rounded-3xl border border-black/5 bg-white p-5"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm text-black/45">{summary ? `Resumo disponível · ${summary.sourceType}` : "Resumo ainda não criado"}</p><button type="button" disabled={loading === item.id} onClick={() => summary ? setOpen(open === item.id ? null : item.id) : void generate(item)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading === item.id ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{loading === item.id ? "Gerando..." : summary ? (open === item.id ? "Fechar resumo" : "Ver resumo") : "Gerar resumo"}</button>{summary && open === item.id && <div className="mt-5 space-y-4 border-t border-black/5 pt-4 text-sm leading-6"><p>{summary.content.overview}</p>{summary.content.keyConcepts?.length ? <SummaryList title="Conceitos-chave" values={summary.content.keyConcepts} /> : null}{summary.content.definitions?.length ? <SummaryList title="Definições" values={summary.content.definitions} /> : null}{summary.content.importantPoints?.length ? <SummaryList title="Pontos importantes" values={summary.content.importantPoints} /> : null}{summary.content.reviewQuestions?.length ? <SummaryList title="Perguntas para revisar" values={summary.content.reviewQuestions} /> : null}</div>}</article> })}</div>}
    <form onSubmit={generateManual} className="mt-4 rounded-3xl border border-dashed border-black/15 bg-white/60 p-5">
      <div className="flex items-center gap-2"><Link className="size-4 text-sky-600" /><h3 className="font-semibold">Adicionar link direto</h3></div>
      <p className="mt-1 text-sm text-black/45">Para materiais dentro de um Google Site, cole aqui o link do Slides, Docs ou Drive.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_auto]"><input required value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} placeholder="Título da aula" className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-sky-400" /><input required type="url" value={manualUrl} onChange={(event) => setManualUrl(event.target.value)} placeholder="https://docs.google.com/..." className="h-10 rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-sky-400" /><button type="submit" disabled={loading === `manual:${manualUrl.trim()}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-sky-600 px-4 text-sm font-semibold text-white disabled:opacity-50">{loading === `manual:${manualUrl.trim()}` ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}Gerar</button></div>
    </form>
  </section>
}

function SummaryList({ title, values }: { title: string; values: string[] }) { return <div><h4 className="font-semibold">{title}</h4><ul className="mt-1 list-disc space-y-1 pl-5 text-black/65">{values.map((value, index) => <li key={`${title}-${index}`}>{value}</li>)}</ul></div> }