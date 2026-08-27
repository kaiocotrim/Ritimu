"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Check, LoaderCircle, RefreshCw } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

type SyncGoogleClassroomProps = {
  initiallySynced?: boolean
}

export function SyncGoogleClassroom({ initiallySynced = false }: SyncGoogleClassroomProps) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [isSyncing, setIsSyncing] = useState(false)
  const [isSynced, setIsSynced] = useState(initiallySynced)
  const [error, setError] = useState<string | null>(null)

  async function handleSync() {
    setIsSyncing(true)
    setError(null)

    try {
      const response = await fetch("/api/classroom/sync", { method: "POST" })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error ?? "Não foi possível sincronizar as matérias")

      setIsSynced(true)
      router.refresh()
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Não foi possível sincronizar as matérias")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <motion.button
        type="button"
        onClick={() => void handleSync()}
        disabled={isSyncing}
        className={`relative flex min-w-60 items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-wait ${isSynced ? "bg-[#EAF8EC] text-[#2F8F3A] ring-1 ring-[#50D05C]/25 hover:bg-[#DDF4E0]" : "bg-black text-white hover:bg-black/80"}`}
        whileHover={reduceMotion || isSyncing ? undefined : { y: -2, scale: 1.015 }}
        whileTap={reduceMotion || isSyncing ? undefined : { scale: 0.98 }}
        layout
      >
        {isSynced && !isSyncing && <motion.span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,.65)_45%,transparent_70%)]" initial={reduceMotion ? false : { x: "-120%" }} animate={reduceMotion ? undefined : { x: "120%" }} transition={{ duration: 0.75, delay: 0.15 }} />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={isSyncing ? "syncing" : isSynced ? "synced" : "idle"} className="relative flex items-center gap-2" initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: 0.2 }}>
            {isSyncing ? <LoaderCircle className="size-4 animate-spin" /> : isSynced ? <Check className="size-4" /> : <RefreshCw className="size-4" />}
            {isSyncing ? "Sincronizando..." : isSynced ? "Google Classroom sincronizado" : "Sincronizar Google Classroom"}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <AnimatePresence>
        {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="max-w-xs text-right text-sm text-destructive">{error}</motion.p>}
      </AnimatePresence>
    </div>
  )
}
