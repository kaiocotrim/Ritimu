"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, Gamepad2, LogIn, Plus, Swords } from "lucide-react"
import { normalizeRoomCode } from "@/lib/x1/room-code"

export function X1Home() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [createdCode, setCreatedCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function createRoom() {
    setBusy(true); setError("")
    const response = await fetch("/api/x1/rooms", { method: "POST" })
    const body: { code?: string; error?: string } = await response.json()
    setBusy(false)
    if (!response.ok || !body.code) return setError(body.error ?? "Não foi possível criar a sala.")
    setCreatedCode(body.code)
  }

  async function enterRoom(value = code) {
    const normalized = normalizeRoomCode(value)
    setBusy(true); setError("")
    const response = await fetch(`/api/x1/${normalized}/join`, { method: "POST" })
    const body: { code?: string; error?: string } = await response.json()
    setBusy(false)
    if (!response.ok || !body.code) return setError(body.error ?? "Não foi possível entrar na sala.")
    router.push(`/x1/${body.code}`)
  }

  async function copyCode() {
    await navigator.clipboard.writeText(createdCode); setCopied(true); window.setTimeout(() => setCopied(false), 1500)
  }

  return <div className="mx-auto max-w-6xl">
    <header className="mb-8"><span className="inline-flex items-center gap-2 rounded-full bg-[#50D05C]/15 px-3 py-1 text-sm font-bold text-green-800"><Gamepad2 className="size-4" /> X1 de conhecimento</span><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Jogo da velha valendo conhecimento</h1><p className="mt-3 max-w-2xl text-black/50">Escolha uma casa, responda corretamente e conquiste seu símbolo. Três em linha vencem a partida.</p></header>
    <div className="grid gap-5 md:grid-cols-2">
      <section className="relative overflow-hidden rounded-[2rem] bg-black p-7 text-white shadow-xl sm:p-9"><div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#50D05C]/20 blur-3xl" /><Plus className="relative size-8 text-[#50D05C]" /><h2 className="relative mt-5 text-2xl font-bold">Criar uma sala</h2><p className="relative mt-2 text-sm text-white/55">Gere um código e envie para seu adversário.</p>
        {!createdCode ? <button onClick={createRoom} disabled={busy} className="relative mt-8 w-full rounded-full bg-[#50D05C] px-5 py-3.5 font-bold text-black transition hover:bg-[#43bd4e] disabled:opacity-50">{busy ? "Criando…" : "Criar sala"}</button> : <div className="relative mt-7"><div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-5 py-4"><strong className="text-2xl tracking-[.28em]">{createdCode}</strong><button onClick={copyCode} aria-label="Copiar código" className="rounded-full p-2 hover:bg-white/10">{copied ? <Check className="size-5 text-[#50D05C]" /> : <Copy className="size-5" />}</button></div><button onClick={() => enterRoom(createdCode)} className="mt-3 w-full rounded-full bg-[#50D05C] px-5 py-3.5 font-bold text-black">Entrar no lobby</button></div>}
      </section>
      <section className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-sm sm:p-9"><LogIn className="size-8 text-[#50D05C]" /><h2 className="mt-5 text-2xl font-bold">Entrar com código</h2><p className="mt-2 text-sm text-black/45">Digite o código compartilhado pelo criador da sala.</p><label htmlFor="room-code" className="sr-only">Código da sala</label><input id="room-code" value={code} onChange={(event) => setCode(normalizeRoomCode(event.target.value))} onKeyDown={(event) => { if (event.key === "Enter" && code.length === 6) enterRoom() }} placeholder="ABC123" className="mt-8 h-14 w-full rounded-2xl border border-black/10 bg-[#F6F5F1] px-4 text-center text-xl font-black uppercase tracking-[.28em] outline-none focus:border-[#50D05C] focus:ring-4 focus:ring-[#50D05C]/10" /><button onClick={() => enterRoom()} disabled={busy || code.length !== 6} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3.5 font-bold text-white disabled:opacity-40"><Swords className="size-5 text-[#50D05C]" /> Entrar na sala</button></section>
    </div>{error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="mt-6 grid gap-3 sm:grid-cols-3">{[["1", "Escolha uma matéria"], ["2", "Selecione uma casa"], ["3", "Acerte para marcar"]].map(([number, text]) => <div key={number} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/60 p-4"><span className="flex size-8 items-center justify-center rounded-xl bg-[#50D05C] font-black">{number}</span><span className="text-sm font-semibold">{text}</span></div>)}</section>
  </div>
}
