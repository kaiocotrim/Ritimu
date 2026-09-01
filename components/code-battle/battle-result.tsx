"use client"

import Link from "next/link"
import { Trophy } from "lucide-react"

type Result = { battle: { id: string; winnerId: string | null }; room: { participants: { userId: string; user: { name: string; email: string } }[] }; scores: Record<string, number>; questions: { id: string; statement: string; options: unknown; correctOption: number; explanation: string; answers: { userId: string; selectedOption: number | null; isCorrect: boolean; responseTimeMs: number; points: number }[] }[] }

export function BattleResult({ result, userId }: { result: Result; userId: string }) {
  const title = result.battle.winnerId === null ? "Empate" : result.battle.winnerId === userId ? "Vitoria" : "Derrota"
  return (
    <section className="mx-auto min-h-screen max-w-5xl px-4 pb-32 pt-8 text-[#111111] sm:px-8">
      <div className="rounded-[28px] border border-black/5 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#50D05C]/15">
          <Trophy className="size-9 text-[#248A30]" />
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">{title}</h1>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {result.room.participants.map((participant) => (
            <div key={participant.userId} className="rounded-2xl bg-[#F6F5F1] p-5">
              <p className="font-bold">{participant.user.name}</p>
              <p className="mt-2 text-3xl font-black text-[#248A30]">{result.scores[participant.userId] ?? 0}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#50D05C] px-5 text-sm font-bold text-white transition hover:bg-[#45B950]" href="/code-battle">Jogar novamente</Link>
          <Link className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/10 bg-white px-5 text-sm font-medium text-[#111111] transition hover:bg-black/[.03]" href="/code-battle">Voltar ao Code Battle</Link>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {result.questions.map((question) => {
          const options = Array.isArray(question.options) ? question.options.filter((option): option is string => typeof option === "string") : []
          const mine = question.answers.find((answer) => answer.userId === userId)
          return (
            <div key={question.id} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
              <p className="font-bold">{question.statement}</p>
              <p className="mt-3 text-sm text-black/55">Sua resposta: {mine?.selectedOption === null || mine?.selectedOption === undefined ? "sem resposta" : options[mine.selectedOption]}</p>
              <p className="text-sm font-semibold text-[#248A30]">Correta: {options[question.correctOption]}</p>
              <p className="mt-2 text-sm text-black/45">{question.explanation}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
