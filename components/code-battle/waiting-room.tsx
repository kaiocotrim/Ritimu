"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Copy, LogOut, Play, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  async function post(path: string, body?: unknown) {
    setBusy(true)
    const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) })
    const data = await response.json().catch(() => ({}))
    setBusy(false)
    if (response.ok) { await refresh(); return data }
    alert(data.error ?? "Acao indisponivel.")
  }

  async function start() {
    const data = await post(`/api/code-battle/rooms/${room.id}/start`)
    if (data?.battle?.id) router.push(`/code-battle/partida/${data.battle.id}`)
  }

  return (
    <section className="mx-auto min-h-screen max-w-5xl px-4 pb-32 pt-8 text-[#111111] sm:px-8">
      <div className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-[#248A30]">Sala {room.code}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Sala de espera</h1>
          </div>
          <Button variant="outline" className="h-11 rounded-2xl border-black/10 bg-white text-[#111111] hover:bg-black/[.03]" onClick={() => navigator.clipboard.writeText(`${location.origin}/code-battle/sala/${room.code}`)}>
            <Copy className="size-4" />
            Copiar link
          </Button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#F6F5F1] p-4 text-sm font-semibold">{topicLabels[room.topic]}</div>
          <div className="rounded-2xl bg-[#F6F5F1] p-4 text-sm font-semibold">{difficultyLabels[room.difficulty]}</div>
          <div className="rounded-2xl bg-[#F6F5F1] p-4 text-sm font-semibold">{room.questionCount} perguntas - {room.timePerQuestion}s</div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[0, 1].map((slot) => {
            const participant = room.participants[slot]
            return (
              <div key={slot} className="rounded-2xl border border-black/5 bg-[#F6F5F1] p-5">
                <p className="text-lg font-bold">{participant?.user.name ?? "Aguardando adversario"}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-black/55">
                  {participant?.ready ? <CheckCircle2 className="size-4 text-[#248A30]" /> : <Radio className="size-4" />}
                  {participant ? (participant.ready ? "pronto" : "aguardando") : "vaga aberta"}
                </p>
              </div>
            )
          })}
        </div>
        {room.status === "CANCELED" && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-red-600">Sala encerrada pelo criador.</p>}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button disabled={busy || room.status !== "WAITING"} onClick={() => post(`/api/code-battle/rooms/${room.id}/ready`, { ready: !me?.ready })} className="h-12 rounded-2xl bg-[#50D05C] font-bold text-white hover:bg-[#45B950]">{me?.ready ? "Cancelar pronto" : "Estou pronto"}</Button>
          {isHost && <Button disabled={busy || !canStart} onClick={start} className="h-12 rounded-2xl bg-[#111111] text-white hover:bg-black/85"><Play className="size-4" /> Iniciar</Button>}
          <Button disabled={busy} variant="destructive" onClick={async () => { await post(`/api/code-battle/rooms/${room.id}/leave`); router.push("/code-battle") }} className="h-12 rounded-2xl"><LogOut className="size-4" /> Sair da sala</Button>
        </div>
      </div>
    </section>
  )
}
