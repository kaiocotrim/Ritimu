"use client"

import { motion, useReducedMotion } from "motion/react"

export function InteractiveFormIcon() {
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion ? undefined : { duration: 1.2, ease: "easeOut" as const }

  return (
    <motion.div role="img" aria-label="Missões concluídas" whileHover={reduceMotion ? undefined : { scale: 1.1 }}
      className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400 shadow-[0_0_24px_rgba(163,230,53,0.12)]">
      <svg viewBox="0 0 40 40" className="size-10" fill="none" aria-hidden="true">
        <motion.rect x="9" y="5" width="22" height="30" rx="4" stroke="currentColor" strokeWidth="2"
          animate={reduceMotion ? undefined : { opacity: [0.55, 1] }} transition={transition} />
        <motion.path d="M14 13h12M14 19h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          animate={reduceMotion ? undefined : { pathLength: [0, 1], opacity: [0, 1] }} transition={transition} />
        <motion.circle cx="24.5" cy="27" r="7" fill="#080808" stroke="#a3e635" strokeWidth="2"
          animate={reduceMotion ? undefined : { scale: [0.7, 1], opacity: [0, 1] }} transition={transition}
          style={{ transformOrigin: "24.5px 27px" }} />
        <motion.path d="m21.5 27 2 2 4-4.5" stroke="#a3e635" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          animate={reduceMotion ? undefined : { pathLength: [0, 0, 1] }} transition={transition} />
      </svg>
    </motion.div>
  )
}
