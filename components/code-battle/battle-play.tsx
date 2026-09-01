"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Clock, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"

type State = { battle: { id: string; status: string; currentQuestionIndex: number; questionStartedAt: string | Date | null; winnerId: string | null }; room: { timePerQuestion: number; participants: { userId: string; user: { name: string; email: string } }[] }; question: { id: string; position: number; statement: string; options: string[] } | null; answeredUserIds: string[]; scores: Record<string, number>; timePerQuestion: number }

export function BattlePlay({ initialState, userId }: { initialState: State; userId: string }) {
  const router = useRouter()
  const [state, setState] = useState(initialState)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [now, setNow] = useState(() => new Date().getTime())
  const startedAt = state.battle.questionStartedAt ? new Date(state.battle.questionStartedAt).getTime() : now
  const remaining = Math.max(0, Math.ceil((startedAt + state.timePerQuestion * 1000 - now) / 1000))
  const meAnswered = state.answeredUserIds.includes(userId)
  const opponent = state.room.participants.find((participant) => participant.userId !== userId)
  const me = state.room.participants.find((participant) => participant.userId === userId)
  const progress = Math.round(((state.battle.currentQuestionIndex + 1) / 5) * 100)
  const refresh = useCallback(async () => {
    const response = await fetch(`/api/code-battle/battles/${state.battle.id}`)
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setState(data)
      if (data.battle.status === "FINISHED") router.push(`/code-battle/resultado/${state.battle.id}`)
    }
  }, [router, state.battle.id])

  useEffect(() => {
    const tick = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(tick)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(refresh, 1500)
    return () => window.clearInterval(timer)
  }, [refresh])

  const opponentAnswered = useMemo(() => opponent ? state.answeredUserIds.includes(opponent.userId) : false, [opponent, state.answeredUserIds])

  async function answer(selectedOption: number) {
    if (!state.question || busy || meAnswered || remaining === 0) return
    setBusy(true)
    const response = await fetch(`/api/code-battle/battles/${state.battle.id}/answer`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: state.question.id, selectedOption }) })
    const data = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) return setFeedback(data.error ?? "Nao foi possivel responder.")
    setFeedback(data.result.correct ? `Correto: +${data.result.points}` : data.result.expired ? "Tempo esgotado" : "Resposta enviada")
    await refresh()
  }

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-4 pb-32 pt-8 text-[#111111] sm:px-8">
      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_240px]">
        {[me, opponent].map((player, index) => (
          <div key={index} className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-sm text-black/45">{index === 0 ? "Voce" : "Adversario"}</p>
            <p className="mt-2 truncate font-bold">{player?.user.name ?? "Jogador"}</p>
            <p className="mt-4 text-3xl font-black text-[#248A30]">{state.scores[player?.userId ?? ""] ?? 0}</p>
            <p className="mt-2 min-h-5 text-sm text-black/45">{index === 1 && opponentAnswered ? "respondeu" : ""}</p>
          </div>
        ))}
        <div className="order-first rounded-[28px] border border-black/5 bg-white p-5 shadow-sm lg:order-none">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 font-semibold text-[#248A30]"><Swords className="size-4" /> Questao {state.battle.currentQuestionIndex + 1}/5</span>
            <span className="flex items-center gap-2 rounded-full bg-[#F6F5F1] px-4 py-2 text-xl font-black"><Clock className="size-5" /> {remaining}s</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full bg-[#50D05C]" style={{ width: `${progress}%` }} /></div>
          <h1 className="mt-8 text-2xl font-black tracking-tight">{state.question?.statement ?? "Avancando..."}</h1>
          <div className="mt-6 grid gap-3">
            {state.question?.options.map((option, index) => (
              <Button key={option} disabled={busy || meAnswered || remaining === 0} onClick={() => answer(index)} className="min-h-14 justify-start rounded-2xl border border-black/5 bg-[#F6F5F1] px-5 text-left text-[#111111] hover:bg-[#50D05C]/15">
                {option}
              </Button>
            ))}
          </div>
          {feedback && <p className="mt-4 rounded-2xl bg-[#50D05C]/10 p-4 text-sm font-medium text-[#248A30]">{feedback}</p>}
          {meAnswered && <p className="mt-3 text-sm text-black/45">Aguardando o adversario ou proxima pergunta.</p>}
        </div>
      </div>
    </section>
  )
}
