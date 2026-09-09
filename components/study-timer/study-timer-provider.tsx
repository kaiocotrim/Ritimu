"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

type TimerStatus = "idle" | "running" | "paused" | "finished"

type TimerState = {
  status: TimerStatus
  originalDurationMs: number
  pausedRemainingMs: number
  targetEndTime: number | null
}

type StudyTimerContextValue = {
  state: TimerState
  remainingMs: number
  formattedRemaining: string
  lastMessage: string | null
  supportsDocumentPiP: boolean
  start: (durationMs: number) => void
  pause: () => void
  resume: () => void
  stop: (force?: boolean) => boolean
  dismissMessage: () => void
}

const STORAGE_KEY = "ritimu.studyTimer.v1"
const CHANNEL_NAME = "ritimu-study-timer"
const FINISH_EVENT = "ritimu-study-timer-finished"

const IDLE_STATE: TimerState = {
  status: "idle",
  originalDurationMs: 0,
  pausedRemainingMs: 0,
  targetEndTime: null,
}

const StudyTimerContext = createContext<StudyTimerContextValue | null>(null)

function clampRemaining(value: number) {
  return Math.max(0, Math.ceil(value / 1000) * 1000)
}

function getRemainingFromState(state: TimerState) {
  if (state.status === "running" && state.targetEndTime) {
    return clampRemaining(state.targetEndTime - Date.now())
  }

  if (state.status === "paused") {
    return clampRemaining(state.pausedRemainingMs)
  }

  return 0
}

function normalizeState(state: TimerState): TimerState {
  if (state.status === "running" && state.targetEndTime && state.targetEndTime <= Date.now()) {
    return {
      ...state,
      status: "finished",
      pausedRemainingMs: 0,
      targetEndTime: null,
    }
  }

  return state
}

function parseStoredState(value: string | null): TimerState | null {
  if (!value) return null

  try {
    const parsed = JSON.parse(value) as Partial<TimerState>

    if (
      parsed.status !== "idle" &&
      parsed.status !== "running" &&
      parsed.status !== "paused" &&
      parsed.status !== "finished"
    ) {
      return null
    }

    return normalizeState({
      status: parsed.status,
      originalDurationMs: Number(parsed.originalDurationMs) || 0,
      pausedRemainingMs: Number(parsed.pausedRemainingMs) || 0,
      targetEndTime: typeof parsed.targetEndTime === "number" ? parsed.targetEndTime : null,
    })
  } catch {
    return null
  }
}

function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((part) => part.toString().padStart(2, "0"))
    .join(":")
}

function subscribeToSupportChanges() {
  return () => undefined
}

function getDocumentPiPSupportSnapshot() {
  return typeof window !== "undefined" && "documentPictureInPicture" in window
}

function playFinishedSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = "sine"
  oscillator.frequency.setValueAtTime(880, context.currentTime)
  gain.gain.setValueAtTime(0.001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.5)
}

export function StudyTimerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TimerState>(() => {
    if (typeof window === "undefined") return IDLE_STATE
    return parseStoredState(localStorage.getItem(STORAGE_KEY)) ?? IDLE_STATE
  })
  const [remainingMs, setRemainingMs] = useState(() => getRemainingFromState(state))
  const [lastMessage, setLastMessage] = useState<string | null>(() => {
    if (state.status === "finished") return "Tempo encerrado."
    return null
  })
  const supportsDocumentPiP = useSyncExternalStore(
    subscribeToSupportChanges,
    getDocumentPiPSupportSnapshot,
    () => false
  )
  const hasHydrated = useRef(false)
  const finishNotifiedFor = useRef<number | null>(null)
  const channelRef = useRef<BroadcastChannel | null>(null)

  const publishState = useCallback((nextState: TimerState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState))
    channelRef.current?.postMessage(nextState)
  }, [])

  const finishTimer = useCallback((sourceState: TimerState) => {
    const finishedState: TimerState = {
      ...sourceState,
      status: "finished",
      pausedRemainingMs: 0,
      targetEndTime: null,
    }

    setState(finishedState)
    setRemainingMs(0)
    publishState(finishedState)
    setLastMessage("Tempo encerrado.")

    if (finishNotifiedFor.current !== sourceState.targetEndTime) {
      finishNotifiedFor.current = sourceState.targetEndTime
      window.dispatchEvent(new CustomEvent(FINISH_EVENT))
      playFinishedSound()

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Cronômetro", { body: "Seu tempo de estudo terminou." })
      }
    }
  }, [publishState])

  useEffect(() => {
    hasHydrated.current = true

    if ("BroadcastChannel" in window) {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME)
      channelRef.current.onmessage = (event: MessageEvent<TimerState>) => {
        const nextState = normalizeState(event.data)
        setState(nextState)
        setRemainingMs(getRemainingFromState(nextState))
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return
      const nextState = parseStoredState(event.newValue)
      if (!nextState) return
      setState(nextState)
      setRemainingMs(getRemainingFromState(nextState))
    }

    window.addEventListener("storage", handleStorage)

    return () => {
      window.removeEventListener("storage", handleStorage)
      channelRef.current?.close()
      channelRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated.current) return
    publishState(state)
  }, [publishState, state])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setRemainingMs(getRemainingFromState(state))

      if (state.status === "running" && state.targetEndTime && state.targetEndTime <= Date.now()) {
        finishTimer(state)
      }
    }, 500)

    return () => window.clearInterval(intervalId)
  }, [finishTimer, state])

  const start = useCallback((durationMs: number) => {
    if (durationMs <= 0) {
      setLastMessage("Defina uma duração maior que zero.")
      return
    }

    finishNotifiedFor.current = null
    const nextState: TimerState = {
      status: "running",
      originalDurationMs: durationMs,
      pausedRemainingMs: durationMs,
      targetEndTime: Date.now() + durationMs,
    }

    setState(nextState)
    setRemainingMs(durationMs)
    setLastMessage(null)
  }, [])

  const pause = useCallback(() => {
    setState((current) => {
      if (current.status !== "running") return current

      return {
        ...current,
        status: "paused",
        pausedRemainingMs: getRemainingFromState(current),
        targetEndTime: null,
      }
    })
  }, [])

  const resume = useCallback(() => {
    setState((current) => {
      if (current.status !== "paused" || current.pausedRemainingMs <= 0) return current

      return {
        ...current,
        status: "running",
        targetEndTime: Date.now() + current.pausedRemainingMs,
      }
    })
  }, [])

  const stop = useCallback((force = false) => {
    const hasTimeLeft = getRemainingFromState(state) > 0
    if (!force && hasTimeLeft && !window.confirm("Encerrar o cronômetro antes do tempo terminar?")) {
      return false
    }

    finishNotifiedFor.current = null
    setState(IDLE_STATE)
    setRemainingMs(0)
    setLastMessage(null)
    return true
  }, [state])

  const dismissMessage = useCallback(() => setLastMessage(null), [])

  const value = useMemo<StudyTimerContextValue>(() => ({
    state,
    remainingMs,
    formattedRemaining: formatDuration(remainingMs),
    lastMessage,
    supportsDocumentPiP,
    start,
    pause,
    resume,
    stop,
    dismissMessage,
  }), [
    dismissMessage,
    lastMessage,
    pause,
    remainingMs,
    resume,
    start,
    state,
    stop,
    supportsDocumentPiP,
  ])

  return (
    <StudyTimerContext.Provider value={value}>
      {children}
    </StudyTimerContext.Provider>
  )
}

export function useStudyTimer() {
  const context = useContext(StudyTimerContext)

  if (!context) {
    throw new Error("useStudyTimer must be used inside StudyTimerProvider")
  }

  return context
}

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow: (options?: { width?: number; height?: number }) => Promise<Window>
    }
    webkitAudioContext?: typeof AudioContext
  }
}
