"use client"

import { useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Bot, Check, Clock3, Copy, DoorOpen, Plus, RefreshCcw, ShieldCheck, Swords, Trophy, UsersRound } from "lucide-react"
import { normalizeRoomCode } from "@/lib/x1/room-code"
import { TopicCombobox, type TopicOption } from "@/components/x1/topic-combobox"

const popularTopics = ["Futebol", "Jiu-jítsu", "História", "Geografia", "Animes", "Minecraft"]
const difficulties = [["EASY", "Fácil"], ["MEDIUM", "Médio"], ["HARD", "Difícil"]] as const

export function X1Home() {
  const router = useRouter(), reduceMotion = useReducedMotion()
  const [code, setCode] = useState(""), [createdCode, setCreatedCode] = useState(""), [copied, setCopied] = useState(false)
  const [mode, setMode] = useState<"CREATE" | "JOIN">("CREATE")
  const [busy, setBusy] = useState(false), [error, setError] = useState("")
  const [turnTimeSeconds, setTurnTimeSeconds] = useState<number | null>(30), [allowCapture, setAllowCapture] = useState(false), [vsBot, setVsBot] = useState(false)
  const [botDifficulty, setBotDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM"), [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM")
  const [topic, setTopic] = useState<TopicOption | null>(null), [subtopic, setSubtopic] = useState("ALL")

  async function createRoom() {
    setError("")
    if (!topic) { setError("Escolha ou crie um tema antes de continuar."); return }
    setBusy(true)
    const response = await fetch("/api/x1/rooms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ turnTimeSeconds, allowCapture, vsBot, botDifficulty, difficulty, topicId: topic.id, subtopic }) })
    const body: { code?: string; error?: string } = await response.json()
    setBusy(false)
    if (!response.ok || !body.code) return setError(body.error ?? "Não foi possível criar a sala.")
    if (vsBot) router.push(`/x1/${body.code}`); else setCreatedCode(body.code)
  }

  async function enterRoom(value = code) {
    const normalized = normalizeRoomCode(value); setBusy(true); setError("")
    const response = await fetch(`/api/x1/${normalized}/join`, { method: "POST" })
    const body: { code?: string; error?: string } = await response.json(); setBusy(false)
    if (!response.ok || !body.code) return setError(body.error ?? "Não foi possível entrar na sala.")
    router.push(`/x1/${body.code}`)
  }

  async function selectPopular(name: string) {
    const response = await fetch(`/api/x1/topics?q=${encodeURIComponent(name)}`, { cache: "no-store" })
    const data = await response.json().catch(() => null)
    const found = data?.topics?.find((item: TopicOption) => item.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR"))
    if (found) { setTopic(found); setSubtopic("ALL") }
  }

  async function copyCode() { await navigator.clipboard.writeText(createdCode); setCopied(true); window.setTimeout(() => setCopied(false), 1500) }
  const cardMotion = reduceMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } }

  return <div className="x1-screen mx-auto max-w-3xl pb-8">
    <motion.header initial={reduceMotion ? false : { opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mb-7 text-center">
      <h1 className="text-3xl font-black tracking-[-.04em] text-[#101313] sm:text-4xl">Jogo da Velha <span className="text-[#50b92e]">Valendo Conhecimento</span></h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-black/45">Escolha um tema, responda às perguntas e forme três em linha.</p>
    </motion.header>

    <div className="mx-auto mb-4 grid max-w-xl grid-cols-2 rounded-xl border border-black/[.07] bg-white p-1 shadow-sm">
      <button type="button" onClick={() => { setMode("CREATE"); setError("") }} className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${mode === "CREATE" ? "bg-[#111] text-white shadow-sm" : "text-black/45 hover:bg-black/[.03] hover:text-black"}`}><Plus className="size-4" /> Criar sala</button>
      <button type="button" onClick={() => { setMode("JOIN"); setError("") }} className={`flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${mode === "JOIN" ? "bg-[#111] text-white shadow-sm" : "text-black/45 hover:bg-black/[.03] hover:text-black"}`}><DoorOpen className="size-4" /> Entrar com código</button>
    </div>

    <AnimatePresence mode="wait">
      {mode === "CREATE" ? <motion.section key="create" {...cardMotion} transition={{ duration: .22 }} className="mx-auto max-w-xl rounded-2xl border border-black/[.07] bg-white p-5 shadow-sm sm:p-6">
        <CardTitle icon={<Plus className="size-5" />} title="Criar uma sala" description="Configure as regras e convide seu adversário." />
        {!createdCode ? <div className="mt-5">
          <label className="mb-2 block text-xs font-black">Tema do quiz</label><TopicCombobox value={topic} onChange={(next) => { setTopic(next); setSubtopic("ALL") }} />
          <p className="mb-2 mt-3 text-[10px] font-bold text-black/35">Sugestões populares</p><div className="flex flex-wrap gap-1.5">{popularTopics.map((name) => <motion.button whileTap={reduceMotion ? undefined : { scale: .96 }} type="button" key={name} onClick={() => void selectPopular(name)} className="cursor-pointer rounded-full border border-black/[.08] px-3 py-1.5 text-[10px] font-bold text-black/60 shadow-sm transition hover:border-[#79d84a] hover:text-[#45a421]">{name}</motion.button>)}</div>
          {topic && <motion.div initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">{!!topic.subtopics.length && <fieldset className="mt-4"><legend className="text-xs font-black">Subtópico</legend><div className="mt-2 flex flex-wrap gap-1.5">{["Todos", ...topic.subtopics].map((item) => { const value = item === "Todos" ? "ALL" : item; return <OptionPill key={item} active={subtopic === value} onClick={() => setSubtopic(value)}>{item}</OptionPill> })}</div></fieldset>}<fieldset className="mt-4"><legend className="text-xs font-black">Dificuldade das perguntas</legend><div className="mt-2 grid grid-cols-3 gap-2">{difficulties.map(([value, label]) => <OptionButton key={value} active={difficulty === value} onClick={() => setDifficulty(value)}>{label}</OptionButton>)}</div></fieldset></motion.div>}
          <fieldset className="mt-5"><legend className="text-xs font-black">Tempo por turno</legend><div className="mt-2 grid grid-cols-4 gap-2">{[[15, "15s"], [30, "30s"], [60, "60s"], [null, "Livre"]].map(([seconds, label]) => <OptionButton key={label} active={turnTimeSeconds === seconds} onClick={() => setTurnTimeSeconds(seconds as number | null)}><Clock3 className="size-3" />{label}</OptionButton>)}</div></fieldset>
          <ToggleRow checked={vsBot} onChange={setVsBot} icon={<Bot className="size-4" />} title="Jogar contra o Ritimu Bot" description="Comece imediatamente, sem esperar outro jogador." />
          {vsBot && <motion.fieldset initial={reduceMotion ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden"><legend className="text-xs font-black">Dificuldade do bot</legend><div className="mt-2 grid grid-cols-3 gap-2">{difficulties.map(([value, label]) => <OptionButton key={value} active={botDifficulty === value} onClick={() => setBotDifficulty(value)}>{label}</OptionButton>)}</div></motion.fieldset>}
          <ToggleRow checked={allowCapture} onChange={setAllowCapture} icon={<RefreshCcw className="size-4" />} title="Permitir captura de casa" description="Ao acertar, você pode remarcar uma casa adversária." />
          <motion.button whileTap={reduceMotion ? undefined : { scale: .98 }} onClick={createRoom} disabled={busy || !topic} className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#50c735] text-sm font-black text-[#12250d] transition hover:bg-[#45b92d] disabled:cursor-not-allowed disabled:opacity-45"><Swords className="size-4" />{busy ? "Preparando…" : vsBot ? "Jogar contra o bot" : "Criar sala"}</motion.button>
        </div> : <motion.div initial={reduceMotion ? false : { opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 text-center"><p className="text-xs font-bold text-black/40">Compartilhe este código</p><div className="mt-3 flex items-center justify-between rounded-xl border border-[#bce8a8] bg-[#f7fff3] px-5 py-4"><strong className="text-2xl tracking-[.28em]">{createdCode}</strong><button onClick={copyCode} aria-label="Copiar código" className="cursor-pointer rounded-lg p-2 hover:bg-[#e9fbdc]">{copied ? <Check className="size-5 text-[#54bc2b]" /> : <Copy className="size-5" />}</button></div><p className="mt-3 text-xs text-black/40">Preparando perguntas sobre {topic?.name}…</p><button onClick={() => enterRoom(createdCode)} className="mt-4 h-12 w-full cursor-pointer rounded-xl bg-[#72d43a] text-sm font-black">Entrar na sala</button></motion.div>}
      </motion.section> :

      <motion.section key="join" {...cardMotion} transition={{ duration: .22 }} className="mx-auto max-w-xl rounded-2xl border border-black/[.07] bg-white p-5 shadow-sm sm:p-6">
        <CardTitle icon={<DoorOpen className="size-5" />} title="Entrar com código" description="Digite o código compartilhado pelo criador da sala." />
        <label htmlFor="room-code" className="sr-only">Código da sala</label><input id="room-code" value={code} maxLength={6} onChange={(event) => setCode(normalizeRoomCode(event.target.value))} onKeyDown={(event) => { if (event.key === "Enter" && code.length === 6) void enterRoom() }} placeholder="A B C 1 2 3" className="mt-6 h-14 w-full rounded-xl border border-black/[.09] bg-[#fcfcfb] px-4 text-center text-lg font-black uppercase tracking-[.35em] outline-none transition placeholder:text-black/20 focus:border-[#77d744] focus:ring-4 focus:ring-[#77d744]/10" />
        <motion.button whileTap={reduceMotion ? undefined : { scale: .98 }} onClick={() => enterRoom()} disabled={busy || code.length !== 6} className="mt-3 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#171b19] text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-black/[.08] disabled:text-black/25"><Swords className="size-4" /> Entrar na sala</motion.button>
        <div className="mt-5 rounded-2xl border border-[#f0e8cc] bg-[#fffdf5] p-5"><h3 className="text-xs font-black text-[#56b82e]">Como funciona?</h3><div className="mt-4 space-y-4"><HowStep icon={<UsersRound className="size-4" />} text="Cada jogador responde uma pergunta por turno." /><HowStep icon={<ShieldCheck className="size-4" />} text="Responda corretamente para marcar sua peça." /><HowStep icon={<Trophy className="size-4" />} text="Forme três em linha e vença o desafio!" /></div></div>
      </motion.section>}
    </AnimatePresence>
    <AnimatePresence>{error && <motion.p role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-auto mt-5 max-w-xl rounded-xl border border-red-100 bg-red-50 p-3 text-center text-sm font-semibold text-red-700">{error}</motion.p>}</AnimatePresence>
  </div>
}

function CardTitle({ icon, title, description }: { icon: ReactNode; title: string; description: string }) { return <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#ebf8e6] text-[#49af2c]">{icon}</span><div><h2 className="text-lg font-black tracking-[-.02em]">{title}</h2><p className="mt-0.5 text-[11px] text-black/40">{description}</p></div></div> }
function OptionButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`flex h-9 cursor-pointer items-center justify-center gap-1 rounded-lg border text-[10px] font-black transition ${active ? "border-[#87dc51] bg-[#b8ef72] text-[#214012] shadow-sm" : "border-black/[.08] bg-white text-black/55 hover:border-[#9bdc75]"}`}>{children}</button> }
function OptionPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) { return <button type="button" aria-pressed={active} onClick={onClick} className={`cursor-pointer rounded-full border px-3 py-1.5 text-[10px] font-bold transition ${active ? "border-[#79d444] bg-[#e9fbdc] text-[#37931a]" : "border-black/[.08] text-black/50 hover:border-[#79d444]"}`}>{children}</button> }
function ToggleRow({ checked, onChange, icon, title, description }: { checked: boolean; onChange: (checked: boolean) => void; icon: ReactNode; title: string; description: string }) { return <label className="mt-4 flex cursor-pointer items-center gap-3 border-t border-black/[.06] pt-4"><span className="text-[#63c735]">{icon}</span><span className="min-w-0 flex-1"><span className="block text-xs font-black">{title}</span><span className="mt-0.5 block text-[10px] text-black/40">{description}</span></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" /><span className="relative h-6 w-11 shrink-0 rounded-full bg-black/15 transition peer-checked:bg-[#64ca36] after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" /></label> }
function HowStep({ icon, text }: { icon: ReactNode; text: string }) { return <div className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[#edfae6] text-[#5bbd31]">{icon}</span><p className="text-[11px] font-medium text-black/55">{text}</p></div> }
