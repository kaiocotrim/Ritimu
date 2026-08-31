"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"
import { Bot, Check, Clock3, Copy, Gamepad2, LogIn, Plus, RefreshCcw, Swords } from "lucide-react"
import { normalizeRoomCode } from "@/lib/x1/room-code"

export function X1Home() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [createdCode, setCreatedCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [turnTimeSeconds, setTurnTimeSeconds] = useState<number | null>(30)
  const [allowCapture, setAllowCapture] = useState(false)
  const [vsBot, setVsBot] = useState(false)
  const [botDifficulty, setBotDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM")
  const reduceMotion = useReducedMotion()

  async function createRoom() {
    setBusy(true); setError("")
    const response = await fetch("/api/x1/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ turnTimeSeconds, allowCapture, vsBot, botDifficulty }) })
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

  return <div className="x1-screen mx-auto max-w-6xl">
    <header className="mb-8"><span className="inline-flex items-center gap-2 rounded-full bg-[#50D05C]/15 px-3 py-1 text-sm font-bold text-green-800"><Gamepad2 className="size-4" /> X1 de conhecimento</span><h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Jogo da velha valendo conhecimento</h1><p className="mt-3 max-w-2xl text-black/50">Escolha uma casa, responda corretamente e conquiste seu símbolo. Três em linha vencem a partida.</p></header>
    <div className="grid gap-5 md:grid-cols-2">
      <motion.section initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} whileHover={reduceMotion ? undefined : { y: -4 }} transition={{ duration: .35 }} className="relative overflow-hidden rounded-[2rem] bg-black p-7 text-white shadow-xl sm:p-9"><div className="absolute -right-16 -top-16 size-48 rounded-full bg-[#50D05C]/20 blur-3xl" /><Plus className="relative size-8 text-[#50D05C]" /><h2 className="relative mt-5 text-2xl font-bold">Criar uma sala</h2><p className="relative mt-2 text-sm text-white/55">Configure as regras antes de convidar seu adversário.</p>
        {!createdCode ? <div className="relative mt-6"><label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4"><input type="checkbox" checked={vsBot} onChange={(event) => setVsBot(event.target.checked)} className="mt-1 size-4 accent-[#50D05C]" /><span><span className="flex items-center gap-2 text-sm font-bold"><Bot className="size-4 text-[#50D05C]" /> Jogar contra o Ritimu Bot</span><span className="mt-1 block text-xs text-white/45">Comece sem precisar esperar outro jogador.</span></span></label>{vsBot && <motion.fieldset initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3"><legend className="text-xs font-bold text-white/60">Dificuldade do bot</legend><div className="mt-2 grid grid-cols-3 gap-2">{[["EASY", "Fácil"], ["MEDIUM", "Médio"], ["HARD", "Difícil"]].map(([value, label]) => <button type="button" key={value} onClick={() => setBotDifficulty(value as "EASY" | "MEDIUM" | "HARD")} className={`rounded-xl border px-2 py-2 text-xs font-bold ${botDifficulty === value ? "border-[#50D05C] bg-[#50D05C] text-black" : "border-white/15 text-white/60"}`}>{label}</button>)}</div></motion.fieldset>}<fieldset className="mt-5"><legend className="flex items-center gap-2 text-sm font-bold"><Clock3 className="size-4 text-[#50D05C]" /> Tempo por turno</legend><div className="mt-3 grid grid-cols-4 gap-2">{[[15, "15s"], [30, "30s"], [60, "60s"], [null, "Livre"]].map(([seconds, label]) => <button type="button" key={label} onClick={() => setTurnTimeSeconds(seconds as number | null)} aria-pressed={turnTimeSeconds === seconds} className={`rounded-xl border px-2 py-2 text-xs font-bold transition ${turnTimeSeconds === seconds ? "border-[#50D05C] bg-[#50D05C] text-black" : "border-white/15 bg-white/[.06] text-white/65 hover:bg-white/10"}`}>{label}</button>)}</div></fieldset><label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[.06] p-4"><input type="checkbox" checked={allowCapture} onChange={(event) => setAllowCapture(event.target.checked)} className="mt-1 size-4 accent-[#50D05C]" /><span><span className="flex items-center gap-2 text-sm font-bold"><RefreshCcw className="size-4 text-[#50D05C]" /> Permitir captura</span><span className="mt-1 block text-xs leading-relaxed text-white/45">Ao acertar, você pode remarcar uma casa do adversário com seu símbolo.</span></span></label><button onClick={createRoom} disabled={busy} className="mt-6 w-full rounded-full bg-[#50D05C] px-5 py-3.5 font-bold text-black transition hover:bg-[#43bd4e] disabled:opacity-50">{busy ? "Criando…" : vsBot ? "Jogar contra o bot" : "Criar sala configurada"}</button></div> : <motion.div initial={reduceMotion ? false : { opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} className="relative mt-7"><div className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-5 py-4"><strong className="text-2xl tracking-[.28em]">{createdCode}</strong><button onClick={copyCode} aria-label="Copiar código" className="rounded-full p-2 hover:bg-white/10">{copied ? <Check className="size-5 text-[#50D05C]" /> : <Copy className="size-5" />}</button></div><p className="mt-3 text-center text-xs text-white/45">{vsBot ? `Bot ${botDifficulty === "EASY" ? "fácil" : botDifficulty === "MEDIUM" ? "médio" : "difícil"} · ` : ""}{turnTimeSeconds ? `${turnTimeSeconds}s por turno` : "Sem cronômetro"} · {allowCapture ? "captura ligada" : "modo clássico"}</p><button onClick={() => enterRoom(createdCode)} className="mt-3 w-full rounded-full bg-[#50D05C] px-5 py-3.5 font-bold text-black">{vsBot ? "Começar partida" : "Entrar no lobby"}</button></motion.div>}
      </motion.section>
      <motion.section initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} whileHover={reduceMotion ? undefined : { y: -4 }} transition={{ duration: .35, delay: .08 }} className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-sm sm:p-9"><LogIn className="size-8 text-[#50D05C]" /><h2 className="mt-5 text-2xl font-bold">Entrar com código</h2><p className="mt-2 text-sm text-black/45">Digite o código compartilhado pelo criador da sala.</p><label htmlFor="room-code" className="sr-only">Código da sala</label><input id="room-code" value={code} onChange={(event) => setCode(normalizeRoomCode(event.target.value))} onKeyDown={(event) => { if (event.key === "Enter" && code.length === 6) enterRoom() }} placeholder="ABC123" className="mt-8 h-14 w-full rounded-2xl border border-black/10 bg-[#F6F5F1] px-4 text-center text-xl font-black uppercase tracking-[.28em] outline-none focus:border-[#50D05C] focus:ring-4 focus:ring-[#50D05C]/10" /><button onClick={() => enterRoom()} disabled={busy || code.length !== 6} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3.5 font-bold text-white disabled:opacity-40"><Swords className="size-5 text-[#50D05C]" /> Entrar na sala</button></motion.section>
    </div>{error && <p role="alert" className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="mt-6 grid gap-3 sm:grid-cols-3">{[["1", "Escolha uma matéria"], ["2", "Selecione uma casa"], ["3", "Acerte para marcar"]].map(([number, text], index) => <motion.div key={number} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 + index * .06 }} whileHover={reduceMotion ? undefined : { scale: 1.02 }} className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/60 p-4"><span className="flex size-8 items-center justify-center rounded-xl bg-[#50D05C] font-black">{number}</span><span className="text-sm font-semibold">{text}</span></motion.div>)}</section>
  </div>
}
