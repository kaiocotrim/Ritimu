"use client"

import Link from "next/link"
import { Trophy } from "lucide-react"

type Result = { battle: { id: string; winnerId: string | null }; room: { participants: { userId: string; user: { name: string; email: string } }[] }; scores: Record<string, number>; questions: { id: string; statement: string; options: unknown; correctOption: number; explanation: string; answers: { userId: string; selectedOption: number | null; isCorrect: boolean; responseTimeMs: number; points: number }[] }[] }

export function BattleResult({ result, userId }: { result: Result; userId: string }) {
  const title = result.battle.winnerId === null ? "Empate" : result.battle.winnerId === userId ? "Vitoria" : "Derrota"
  return (
    <section className="mx-auto min-h-screen max-w-5xl px-4 pb-32 pt-8 text-white sm:px-8">
      <div className="rounded-[28px] border border-white/10 bg-[#10131a] p-6 text-center">
        <Trophy className="mx-auto size-12 text-[#69E776]" />
        <h1 className="mt-4 text-4xl font-black">{title}</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{result.room.participants.map((participant) => <div key={participant.userId} className="rounded-2xl bg-white/[.04] p-5"><p className="font-bold">{participant.user.name}</p><p className="mt-2 text-3xl font-black text-[#69E776]">{result.scores[participant.userId] ?? 0}</p></div>)}</div>
        <div className="mt-6 flex justify-center gap-3"><Link className="inline-flex h-10 items-center rounded-2xl bg-[#50D05C] px-4 text-sm font-medium text-[#071109]" href="/code-battle">Jogar novamente</Link><Link className="inline-flex h-10 items-center rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white" href="/code-battle">Voltar ao Code Battle</Link></div>
      </div>
      <div className="mt-6 space-y-3">{result.questions.map((question) => {
        const options = Array.isArray(question.options) ? question.options.filter((option): option is string => typeof option === "string") : []
        const mine = question.answers.find((answer) => answer.userId === userId)
        return <div key={question.id} className="rounded-2xl border border-white/10 bg-[#151922] p-5"><p className="font-bold">{question.statement}</p><p className="mt-3 text-sm text-white/60">Sua resposta: {mine?.selectedOption === null || mine?.selectedOption === undefined ? "sem resposta" : options[mine.selectedOption]}</p><p className="text-sm text-[#69E776]">Correta: {options[question.correctOption]}</p><p className="mt-2 text-sm text-white/45">{question.explanation}</p></div>
      })}</div>
    </section>
  )
}
