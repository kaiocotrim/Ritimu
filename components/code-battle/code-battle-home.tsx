"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, LogIn, Plus, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CODE_BATTLE_DIFFICULTIES, CODE_BATTLE_TOPICS, difficultyLabels, topicLabels } from "@/lib/code-battle/types"
import { normalizeCodeBattleRoomCode } from "@/lib/code-battle/room-code"

export function CodeBattleHome({ mode = "home" }: { mode?: "home" | "join" }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [topic, setTopic] = useState("LOGIC")
  const [difficulty, setDifficulty] = useState("BEGINNER")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [history, setHistory] = useState<{ id: string; status: string; winnerId: string | null; room: { code: string; topic: string; difficulty: string } }[]>([])

  useEffect(() => {
    fetch("/api/code-battle/rooms").then((response) => response.json()).then((data) => setHistory(data.history ?? [])).catch(() => null)
  }, [])

  async function create() {
    setLoading(true)
    setError("")
    const response = await fetch("/api/code-battle/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, difficulty, questionCount: 5, timePerQuestion: 20 }) })
    const data = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) return setError(data.error ?? "Nao foi possivel criar a sala.")
    router.push(`/code-battle/sala/${data.room.code}`)
  }

  async function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = normalizeCodeBattleRoomCode(code)
    if (normalized.length !== 6) return setError("Informe um codigo de 6 caracteres.")
    setLoading(true)
    setError("")
    const response = await fetch("/api/code-battle/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: normalized }) })
    const data = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) return setError(data.error ?? "Nao foi possivel entrar.")
    router.push(`/code-battle/sala/${data.room.code}`)
  }

  return (
    <section className="mx-auto min-h-screen max-w-6xl px-4 pb-32 pt-8 text-white sm:px-8 lg:px-16">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-start">
        <div className="rounded-[28px] border border-white/10 bg-[#10131a] p-6 shadow-2xl shadow-black/20">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#50D05C]/15 px-3 py-1 text-sm font-semibold text-[#69E776]">
            <Swords className="size-4" /> Code Battle
          </span>
          <h1 className="mt-5 text-4xl font-black sm:text-5xl">Code Battle</h1>
          <p className="mt-3 max-w-xl text-white/60">Desafie, aprenda e evolua em batalhas de programacao</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Button onClick={create} disabled={loading} className="h-14 rounded-2xl bg-[#50D05C] text-base font-bold text-[#071109] hover:bg-[#69E776]">
              <Plus className="size-5" /> Criar batalha
            </Button>
            <Link href="/code-battle/entrar" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-base font-medium text-white transition hover:bg-white/10">
              <LogIn className="size-5" /> Entrar com codigo
            </Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["Crie uma sala", "Compartilhe o codigo", "Responda rapido"].map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
                <p className="text-sm font-bold text-[#69E776]">0{index + 1}</p>
                <p className="mt-2 font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-[#151922] p-5">
          {mode === "join" ? (
            <form onSubmit={join} className="space-y-4">
              <h2 className="text-2xl font-bold">Entrar com codigo</h2>
              <Input value={code} onChange={(event) => setCode(normalizeCodeBattleRoomCode(event.target.value).slice(0, 6))} className="h-14 bg-white/10 text-center text-xl font-black uppercase tracking-[.2em] text-white" placeholder="RTM7K2" />
              <Button disabled={loading} className="h-12 w-full rounded-2xl bg-[#50D05C] text-[#071109]"><LogIn className="size-4" /> Entrar</Button>
            </form>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Criar sala</h2>
              <select value={topic} onChange={(event) => setTopic(event.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-[#0c0f15] px-4 text-white">
                {CODE_BATTLE_TOPICS.map((item) => <option key={item} value={item}>{topicLabels[item]}</option>)}
              </select>
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="h-12 w-full rounded-2xl border border-white/10 bg-[#0c0f15] px-4 text-white">
                {CODE_BATTLE_DIFFICULTIES.map((item) => <option key={item} value={item}>{difficultyLabels[item]}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3 text-sm text-white/60"><div className="rounded-2xl bg-white/[.04] p-4">5 perguntas</div><div className="rounded-2xl bg-white/[.04] p-4">20s por pergunta</div></div>
              <Button onClick={create} disabled={loading} className="h-12 w-full rounded-2xl bg-[#50D05C] text-[#071109]"><Copy className="size-4" /> Criar sala</Button>
            </div>
          )}
          {error && <p className="mt-4 rounded-2xl bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        </div>
      </div>
      <div className="mt-6 rounded-[28px] border border-white/10 bg-[#10131a] p-5">
        <h2 className="text-xl font-bold">Historico recente</h2>
        {!history.length ? <p className="mt-4 text-white/45">Ainda nao ha batalhas finalizadas.</p> : <div className="mt-4 grid gap-3">{history.map((item) => <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white/[.04] p-4"><span>{item.room.code} · {topicLabels[item.room.topic as keyof typeof topicLabels]}</span><span className="text-[#69E776]">{item.status}</span></div>)}</div>}
      </div>
    </section>
  )
}
