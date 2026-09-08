"use client"

import { motion, useReducedMotion } from "motion/react"
import { useState } from "react"

export function InteractiveRepostIcon() {
  const [active, setActive] = useState(false)
  const reduceMotion = useReducedMotion()

  return (
    <motion.button type="button" aria-label={active ? "Desativar impulso de XP" : "Ativar impulso de XP"}
      aria-pressed={active} onClick={() => setActive((value) => !value)}
      whileHover={reduceMotion ? undefined : { scale: 1.1 }} whileTap={reduceMotion ? undefined : { scale: 0.9 }}
      className="group relative flex size-14 shrink-0 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400 shadow-[0_0_24px_rgba(163,230,53,0.12)] outline-none focus-visible:ring-2 focus-visible:ring-lime-300">
      <motion.span animate={reduceMotion ? undefined : { rotate: active ? 180 : 0 }}
        whileHover={reduceMotion ? undefined : { rotate: active ? 360 : 180 }}
        transition={reduceMotion ? undefined : { duration: 0.45, ease: "easeOut" }}
        className="flex items-center justify-center">
        <svg viewBox="0 0 32 32" className="size-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" aria-hidden="true">
          <path d="M7 11.5h15.5l-3.5-3.5" />
          <path d="m22.5 11.5-3.5 3.5" />
          <path d="M25 20.5H9.5l3.5 3.5" />
          <path d="m9.5 20.5 3.5-3.5" />
        </svg>
      </motion.span>
      <motion.span aria-hidden="true" animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.4 }}
        className="absolute right-1.5 top-1.5 size-2 rounded-full bg-lime-300 shadow-[0_0_8px_#bef264]" />
    </motion.button>
  )
}
