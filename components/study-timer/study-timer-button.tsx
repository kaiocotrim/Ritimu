"use client"

import { useEffect, useRef, useState } from "react"
import { Clock, ExternalLink, Pause, Play, Square, X } from "lucide-react"

import { useStudyTimer } from "@/components/study-timer/study-timer-provider"

const PRESETS = [
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
  { label: "1 h", seconds: 60 * 60 },
]

export function StudyTimerButton() {
  const timer = useStudyTimer()
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState("0")
  const [minutes, setMinutes] = useState("25")
  const [seconds, setSeconds] = useState("0")
  const [pipError, setPipError] = useState<string | null>(null)
  const [pipRenderKey, setPipRenderKey] = useState(0)
  const pipWindowRef = useRef<Window | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const isActive = timer.state.status === "running" || timer.state.status === "paused"

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  useEffect(() => {
    return () => {
      pipWindowRef.current?.close()
    }
  }, [])

  useEffect(() => {
    const miniPlayerWindow = pipWindowRef.current
    if (!miniPlayerWindow || miniPlayerWindow.closed) return

    const doc = miniPlayerWindow.document
    doc.body.innerHTML = ""
    doc.body.style.margin = "0"
    doc.body.style.fontFamily = "Inter, system-ui, sans-serif"
    doc.body.style.background = "#ffffff"
    doc.body.style.color = "#111111"

    const app = doc.createElement("main")
    app.style.cssText = "box-sizing:border-box;display:flex;min-height:100vh;flex-direction:column;gap:14px;padding:18px;border:1px solid rgba(0,0,0,.08);"

    const title = doc.createElement("p")
    title.textContent = "Cronômetro"
    title.style.cssText = "margin:0;font-size:12px;font-weight:700;color:rgba(0,0,0,.5);"

    const time = doc.createElement("div")
    time.textContent = timer.formattedRemaining
    time.style.cssText = "font-variant-numeric:tabular-nums;font-size:38px;font-weight:750;letter-spacing:0;line-height:1;"

    const controls = doc.createElement("div")
    controls.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;"

    const toggle = doc.createElement("button")
    toggle.type = "button"
    toggle.textContent = timer.state.status === "paused" ? "Continuar" : "Pausar"
    toggle.style.cssText = "flex:1;border:0;border-radius:999px;background:#111;color:#fff;padding:10px 12px;font-weight:700;"
    toggle.onclick = () => {
      if (timer.state.status === "paused") timer.resume()
      else timer.pause()
    }

    const stop = doc.createElement("button")
    stop.type = "button"
    stop.textContent = "Encerrar"
    stop.style.cssText = "flex:1;border:1px solid rgba(0,0,0,.12);border-radius:999px;background:#fff;color:#111;padding:10px 12px;font-weight:700;"
    stop.onclick = () => {
      if (timer.stop()) miniPlayerWindow.close()
    }

    const focus = doc.createElement("button")
    focus.type = "button"
    focus.textContent = "Voltar"
    focus.style.cssText = "width:100%;border:0;border-radius:999px;background:rgba(0,0,0,.06);color:#111;padding:9px 12px;font-weight:700;"
    focus.onclick = () => window.focus()

    controls.append(toggle, stop, focus)
    app.append(title, time, controls)
    doc.body.append(app)
  }, [pipRenderKey, timer])

  async function openMiniPlayer() {
    if (!timer.supportsDocumentPiP || !window.documentPictureInPicture) {
      setPipError("Modo flutuante indisponível neste navegador.")
      return
    }

    try {
      setPipError(null)
      const nextWindow = await window.documentPictureInPicture.requestWindow({
        width: 320,
        height: 180,
      })
      nextWindow.addEventListener("pagehide", () => {
        pipWindowRef.current = null
        setPipRenderKey((current) => current + 1)
      }, { once: true })
      pipWindowRef.current = nextWindow
      setPipRenderKey((current) => current + 1)
    } catch {
      setPipError("Não foi possível abrir o miniplayer agora.")
    }
  }

  function totalDurationMs() {
    const totalSeconds =
      (Number(hours) || 0) * 3600 +
      (Number(minutes) || 0) * 60 +
      (Number(seconds) || 0)

    return totalSeconds * 1000
  }

  async function handleStart() {
    const durationMs = totalDurationMs()
    timer.start(durationMs)

    if (durationMs > 0 && timer.supportsDocumentPiP) {
      await openMiniPlayer()
    }
  }

  function applyPreset(totalSeconds: number) {
    setHours(String(Math.floor(totalSeconds / 3600)))
    setMinutes(String(Math.floor((totalSeconds % 3600) / 60)))
    setSeconds(String(totalSeconds % 60))
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Abrir cronômetro"
        title="Cronômetro"
        onClick={() => setIsOpen((current) => !current)}
        className="group flex size-11 items-center justify-center rounded-full border border-black/[.08] bg-white text-black/70 shadow-sm transition hover:border-black/15 hover:text-black hover:shadow-md"
      >
        <Clock className="size-5" aria-hidden="true" />
      </button>

      {isOpen && (
        <section className="absolute right-0 z-40 mt-3 w-[min(340px,calc(100vw-2rem))] rounded-3xl border border-black/10 bg-white p-4 text-black shadow-xl shadow-black/10 sm:right-auto sm:left-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold">Cronômetro</h2>
            <button
              type="button"
              aria-label="Fechar cronômetro"
              onClick={() => setIsOpen(false)}
              className="flex size-8 items-center justify-center rounded-full text-black/45 transition hover:bg-black/[.04] hover:text-black"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          {isActive ? (
            <div>
              <div className="mb-4 text-center font-mono text-4xl font-bold tabular-nums">
                {timer.formattedRemaining}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={timer.state.status === "paused" ? timer.resume : timer.pause}
                  className="flex items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
                >
                  {timer.state.status === "paused" ? <Play className="size-4" /> : <Pause className="size-4" />}
                  {timer.state.status === "paused" ? "Continuar" : "Pausar"}
                </button>
                <button
                  type="button"
                  onClick={() => timer.stop()}
                  className="flex items-center justify-center gap-2 rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-black/70 transition hover:border-black/20 hover:text-black"
                >
                  <Square className="size-4" />
                  Encerrar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["Horas", hours, setHours],
                  ["Min", minutes, setMinutes],
                  ["Seg", seconds, setSeconds],
                ].map(([label, value, setter]) => (
                  <label key={label as string} className="text-xs font-medium text-black/45">
                    {label as string}
                    <input
                      type="number"
                      min="0"
                      max={label === "Horas" ? 23 : 59}
                      value={value as string}
                      onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                      className="mt-1 h-11 w-full rounded-2xl border border-black/10 bg-black/[.025] px-3 text-center text-sm font-semibold text-black outline-none focus:border-black/25"
                    />
                  </label>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPreset(preset.seconds)}
                    className="flex-1 rounded-full border border-black/10 px-3 py-2 text-xs font-semibold text-black/55 transition hover:border-black/20 hover:text-black"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => void handleStart()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
              >
                <Play className="size-4" aria-hidden="true" />
                Iniciar
              </button>
            </div>
          )}

          {isActive && timer.supportsDocumentPiP && (
            <button
              type="button"
              onClick={() => void openMiniPlayer()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-black/[.04] px-4 py-2.5 text-sm font-semibold text-black/65 transition hover:bg-black/[.07] hover:text-black"
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Abrir miniplayer
            </button>
          )}

          {!timer.supportsDocumentPiP && (
            <p className="mt-3 text-xs text-black/40">
              Modo flutuante indisponível neste navegador.
            </p>
          )}

          <p aria-live="polite" className="mt-3 min-h-4 text-xs text-black/45">
            {timer.lastMessage ?? pipError}
          </p>
        </section>
      )}
    </div>
  )
}
