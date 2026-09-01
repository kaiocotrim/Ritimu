"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Copy, LogOut, Play, Radio, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { codeBattleChannelName } from "@/lib/code-battle/realtime"
import { difficultyLabels, topicLabels } from "@/lib/code-battle/types"

type RoomState = { id: string; code: string; hostId: string; topic: keyof typeof topicLabels; difficulty: keyof typeof difficultyLabels; questionCount: number; timePerQuestion: number; status: string; battle: { id: string; status: string } | null; participants: { userId: string; ready: boolean; user: { id: string; name: string; email: string; image: string | null } }[] }

export function WaitingRoom({ initialRoom, userId }: { initialRoom: RoomState; userId: string }) {
  const router = useRouter()
  const [room, setRoom] = useState(initialRoom)
  const [busy, setBusy] = useState(false)
  const isHost = room.hostId === userId
  const me = room.participants.find((participant) => participant.userId === userId)
  const canStart = isHost && room.participants.length === 2 && room.participants.every((participant) => participant.ready)
  const refresh = useCallback(async () => {
    const response = await fetch(`/api/code-battle/rooms/code/${room.code}`)
    const data = await response.json().catch(() => ({}))
    if (response.ok) {
      setRoom(data.room)
      if (data.room.battle?.id && data.room.status === "PLAYING") router.push(`/code-battle/partida/${data.room.battle.id}`)
    }
  }, [room.code, router])
  useEffect(() => {
    const timer = window.setInterval(refresh, 2000)
    return () => window.clearInterval(timer)
  }, [refresh])
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return
    const channel = supabase.channel(codeBattleChannelName(room.code)).on("broadcast", { event: "code-battle" }, () => void refresh()).subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [refresh, room.code])
  async function broadcast() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) await supabase.channel(codeBattleChannelName(room.code)).send({ type: "broadcast", event: "code-battle", payload: {} })
  }
  async function post(path: string, body?: unknown) {
    setBusy(true)
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })
    const data = await response.json().catch(() => ({}))
    setBusy(false)
    if (response.ok) { await refresh(); await broadcast(); return data }
    alert(data.error ?? "Acao indisponivel.")
  }
  async function start() {
    const data = await post(`/api/code-battle/rooms/${room.id}/start`)
    if (data?.battle?.id) router.push(`/code-battle/partida/${data.battle.id}`)
  }
  return (
    <section className="mx-auto min-h-screen max-w-5xl px-4 pb-32 pt-8 text-white sm:px-8">
      <div className="rounded-[28px] border border-white/10 bg-[#10131a] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-bold text-[#69E776]">Sala {room.code}</p><h1 className="mt-2 text-3xl font-black">Sala de espera</h1></div>
          <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-white" onClick={() => navigator.clipboard.writeText(`${location.origin}/code-battle/sala/${room.code}`)}><Copy className="size-4" /> Copiar link</Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/[.04] p-4">{topicLabels[room.topic]}</div>
          <div className="rounded-2xl bg-white/[.04] p-4">{difficultyLabels[room.difficulty]}</div>
          <div className="rounded-2xl bg-white/[.04] p-4">{room.questionCount} perguntas · {room.timePerQuestion}s</div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[0, 1].map((slot) => {
            const participant = room.participants[slot]
            return <div key={slot} className="rounded-2xl border border-white/10 bg-white/[.04] p-5"><p className="text-lg font-bold">{participant?.user.name ?? "Aguardando adversario"}</p><p className="mt-2 flex items-center gap-2 text-sm text-white/55">{participant?.ready ? <CheckCircle2 className="size-4 text-[#69E776]" /> : <Radio className="size-4" />} {participant ? (participant.ready ? "pronto" : "aguardando") : "vaga aberta"}</p></div>
          })}
        </div>
        {room.status === "CANCELED" && <p className="mt-5 rounded-2xl bg-red-500/10 p-4 text-red-200">Sala encerrada pelo criador.</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button disabled={busy || room.status !== "WAITING"} onClick={() => post(`/api/code-battle/rooms/${room.id}/ready`, { ready: !me?.ready })} className="h-12 rounded-2xl bg-[#50D05C] text-[#071109]">{me?.ready ? "Cancelar pronto" : "Estou pronto"}</Button>
          {isHost && <Button disabled={busy || !canStart} onClick={start} className="h-12 rounded-2xl bg-white text-black"><Play className="size-4" /> Iniciar</Button>}
          <Button disabled={busy} variant="destructive" onClick={async () => { await post(`/api/code-battle/rooms/${room.id}/leave`); router.push("/code-battle") }} className="h-12 rounded-2xl"><LogOut className="size-4" /> Sair da sala</Button>
        </div>
      </div>
    </section>
  )
}
