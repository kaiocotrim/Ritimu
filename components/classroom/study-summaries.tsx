"use client"

import { useEffect, useState } from "react"
import { LoaderCircle, Sparkles } from "lucide-react"

type Item = { id: string; title: string; kind: "coursework" | "material" }
type Summary = { id: string; sourceId: string; title: string; sourceType: string; content: { overview?: string; keyConcepts?: string[]; definitions?: string[]; importantPoints?: string[]; reviewQuestions?: string[] }; updatedAt: string }

export function StudySummaries({ courseId, items }: { courseId: string; items: Item[] }) {
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [open, setOpen] = useState<string | null>(null)

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

  return <section className="mt-10" aria-labelledby="summaries-title">
    <div className="mb-4 flex items-center gap-2"><Sparkles className="size-5 text-lime-600" /><h2 id="summaries-title" className="text-xl font-semibold">Resumos inteligentes</h2></div>
    {error && <p role="alert" className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {!items.length ? <p className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-6 text-sm text-black/45">Nenhum material disponível para gerar resumo.</p> : <div className="grid gap-4 md:grid-cols-2">{items.map((item) => { const summary = summaries.find((value) => value.sourceId === item.id); return <article key={`${item.kind}-${item.id}`} className="rounded-3xl border border-black/5 bg-white p-5"><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm text-black/45">{summary ? `Resumo disponível · ${summary.sourceType}` : "Resumo ainda não criado"}</p><button type="button" disabled={loading === item.id} onClick={() => summary ? setOpen(open === item.id ? null : item.id) : void generate(item)} className="mt-4 inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading === item.id ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{loading === item.id ? "Gerando..." : summary ? (open === item.id ? "Fechar resumo" : "Ver resumo") : "Gerar resumo"}</button>{summary && open === item.id && <div className="mt-5 space-y-4 border-t border-black/5 pt-4 text-sm leading-6"><p>{summary.content.overview}</p>{summary.content.keyConcepts?.length ? <SummaryList title="Conceitos-chave" values={summary.content.keyConcepts} /> : null}{summary.content.definitions?.length ? <SummaryList title="Definições" values={summary.content.definitions} /> : null}{summary.content.importantPoints?.length ? <SummaryList title="Pontos importantes" values={summary.content.importantPoints} /> : null}{summary.content.reviewQuestions?.length ? <SummaryList title="Perguntas para revisar" values={summary.content.reviewQuestions} /> : null}</div>}</article> })}</div>}
  </section>
}

function SummaryList({ title, values }: { title: string; values: string[] }) { return <div><h4 className="font-semibold">{title}</h4><ul className="mt-1 list-disc space-y-1 pl-5 text-black/65">{values.map((value, index) => <li key={`${title}-${index}`}>{value}</li>)}</ul></div> }