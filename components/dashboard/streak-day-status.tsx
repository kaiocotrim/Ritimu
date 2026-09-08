"use client"

import { motion, useReducedMotion } from "motion/react"

import { SuccessConfettiIcon } from "@/components/animations/success-confetti/page"

export function StreakDayStatus({ done, missed, isToday }: {
  done: boolean
  missed: boolean
  isToday: boolean
}) {
  const reduceMotion = useReducedMotion()

  if (done) return <SuccessConfettiIcon className="h-12 w-12 scale-[2.2]" />

  if (missed) {
    return (
      <motion.div
        aria-label="Não concluído"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.65, rotate: -8 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 340, damping: 22 }}
        className="flex size-12 items-center justify-center rounded-full border border-rose-300/70 bg-rose-50/80 text-rose-500 shadow-[inset_0_0_14px_rgba(244,63,94,0.08)] transition-colors duration-700 group-hover:border-rose-300/50 group-hover:bg-rose-400/10 group-hover:text-rose-300"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" aria-hidden="true">
          <motion.path d="M7 7l10 10" initial={reduceMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.12 }} />
          <motion.path d="M17 7L7 17" initial={reduceMotion ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.28 }} />
        </svg>
      </motion.div>
    )
  }

  return (
    <div
      aria-label={isToday ? "Hoje, ainda não concluído" : "Dia futuro"}
      className={`size-12 rounded-full border bg-white transition-all duration-700 group-hover:bg-white/10 ${isToday ? "border-[#50D05C] ring-4 ring-[#50D05C]/10 group-hover:border-[#71e27b]" : "border-black/15 group-hover:border-white/30"}`}
    />
  )
}
