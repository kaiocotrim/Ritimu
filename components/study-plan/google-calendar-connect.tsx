"use client"

import { useState } from "react"
import { CalendarCheck2, LoaderCircle } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"

import { authClient } from "@/lib/auth-client"
import { GOOGLE_RITIMU_SCOPES } from "@/lib/google-classroom"

export function GoogleCalendarConnect({ connected, connectedEmail }: { connected: boolean; connectedEmail?: string | null }) {
  const reduceMotion = useReducedMotion()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function connect() {
    setLoading(true)
    setError(null)
    try {
      const result = await authClient.linkSocial({
        provider: "google",
        callbackURL: "/plano-de-estudos",
        scopes: [...GOOGLE_RITIMU_SCOPES],
        additionalParams: { prompt: "select_account consent", access_type: "offline" },
      })
      if (result.error) throw new Error(result.error.message ?? "Não foi possível conectar ao Google.")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível conectar ao Google.")
      setLoading(false)
    }
  }

  return <div className="flex flex-col items-end gap-2">
    <motion.button
      type="button"
      onClick={() => void connect()}
      disabled={loading}
      whileHover={reduceMotion || loading ? undefined : { y: -2, scale: 1.015 }}
      whileTap={reduceMotion || loading ? undefined : { scale: .98 }}
      className="group flex max-w-[240px] cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white px-3.5 py-2 text-xs font-semibold text-[#171717] shadow-[0_10px_28px_rgba(0,0,0,.2)] transition hover:border-[#4285F4]/40 hover:shadow-[0_14px_34px_rgba(66,133,244,.16)] disabled:cursor-wait disabled:opacity-65 sm:max-w-[280px]"
    >
      {loading ? <LoaderCircle className="size-5 animate-spin text-[#4285F4]" /> : <GoogleIcon />}
      <span className="truncate">{loading ? "Abrindo o Google..." : connected ? connectedEmail ?? "Conta Google conectada" : "Entrar com Google"}</span>
      {connected && <span className="grid size-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CalendarCheck2 className="size-3" /></span>}
    </motion.button>
    {error && <p role="alert" className="max-w-sm rounded-xl bg-red-950/80 px-3 py-2 text-right text-xs text-red-200">{error}</p>}
  </div>
}

function GoogleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.35Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.59A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.39 13.9A6 6 0 0 1 6.08 12c0-.66.11-1.3.31-1.9V7.51H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.49l3.35-2.59Z" />
    <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.51 3.83 1.5l2.87-2.88A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.96 5.51L6.39 10.1C7.18 7.73 9.39 5.97 12 5.97Z" />
  </svg>
}
