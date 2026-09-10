"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Trophy } from "lucide-react"
type Result = { correctAnswers: number; total: 50; percentage: number; passed: boolean; certificateEligible: boolean }
type PublicAssessmentQuestion = { id: string; question: string; options: [string, string, string, string] }

export function FullStackAssessment({ roadmapId, unlocked, initialResult }: { roadmapId: string; unlocked: boolean; initialResult: Result | null }) {
  const [questions, setQuestions] = useState<PublicAssessmentQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [startedAt, setStartedAt] = useState("")
  const [result, setResult] = useState(initialResult)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function start() {
    startTransition(async () => {
      setError(null)
      const response = await fetch(`/api/roadmaps/${roadmapId}/assessment`)
      const body = await response.json() as { questions?: PublicAssessmentQuestion[]; startedAt?: string; error?: string }
      if (!response.ok || !body.questions) return setError(body.error ?? "Não foi possível abrir a avaliação.")
      setQuestions(body.questions); setStartedAt(body.startedAt ?? new Date().toISOString()); setAnswers({}); setResult(null)
    })
  }

  function submit() {
    if (Object.keys(answers).length !== 50) return setError("Responda todas as 50 questões antes de enviar.")
    startTransition(async () => {
      setError(null)
      const response = await fetch(`/api/roadmaps/${roadmapId}/assessment/submit`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ answers, startedAt }) })
      const body = await response.json() as Result & { error?: string }
      if (!response.ok) return setError(body.error ?? "Não foi possível corrigir a avaliação.")
      setResult(body); setQuestions([])
    })
  }

  return <section className="border-2 border-[#172017] bg-white p-6 shadow-[5px_5px_0_#2878ff] sm:p-8">
    <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center bg-[#101820] text-[#ffe46b]"><Trophy className="size-6" /></span><div><p className="font-pixel text-[10px] font-bold uppercase tracking-widest text-blue-600">Avaliação final</p><h2 className="font-pixel mt-1 text-2xl font-bold">Full Stack Developer</h2><p className="mt-2 text-sm text-black/55">50 questões · nota mínima 90% (45 acertos)</p></div></div>
    {!unlocked && <p className="font-pixel mt-6 border border-black/10 bg-black/5 p-4 text-xs font-bold uppercase text-black/45">Conclua 100% do conteúdo para desbloquear.</p>}
    {unlocked && questions.length === 0 && <button type="button" onClick={start} disabled={pending} className="font-pixel mt-6 border-2 border-black bg-[#ffe46b] px-5 py-3 text-xs font-bold uppercase shadow-[3px_3px_0_#111] disabled:opacity-60">{pending ? "Carregando..." : result ? "Tentar novamente" : "Iniciar avaliação"}</button>}
    {result && <div className={`mt-6 border-2 p-5 ${result.passed ? "border-green-700 bg-green-50" : "border-red-700 bg-red-50"}`}><p className="font-pixel text-xl font-bold">{result.correctAnswers}/50 · {result.percentage}%</p><p className="font-pixel mt-2 text-xs font-bold uppercase">{result.passed ? "Aprovado · trilha concluída" : "Reprovado · tente novamente"}</p>{result.certificateEligible && <div className="mt-4 border-t border-green-700/20 pt-4"><p className="font-pixel flex items-center gap-2 font-bold text-amber-700"><CheckCircle2 className="size-5" /> Certificado conquistado</p><p className="mt-1 text-sm">Você alcançou 100% na avaliação final. Certificado em breve.</p></div>}</div>}
    {questions.length > 0 && <div className="mt-8 space-y-7">{questions.map((question, index) => <fieldset key={question.id} className="border-t border-black/10 pt-5"><legend className="font-pixel text-sm font-bold leading-6">{index + 1}. {question.question}</legend><div className="mt-3 grid gap-2">{question.options.map((option, optionIndex) => <label key={option} className={`flex cursor-pointer gap-3 border p-3 text-sm ${answers[question.id] === optionIndex ? "border-blue-600 bg-blue-50" : "border-black/10"}`}><input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} /><span>{option}</span></label>)}</div></fieldset>)}<button type="button" onClick={submit} disabled={pending} className="font-pixel w-full border-2 border-black bg-[#50d05c] px-5 py-4 text-xs font-bold uppercase shadow-[3px_3px_0_#111] disabled:opacity-60">{pending ? "Corrigindo..." : `Enviar respostas (${Object.keys(answers).length}/50)`}</button></div>}
    {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p>}
  </section>
}
