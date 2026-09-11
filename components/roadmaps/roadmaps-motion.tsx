"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

const ease = [0.22, 1, 0.36, 1] as const

export function RoadmapsMotionPage({ children, className }: { children: ReactNode; className: string }) {
  const reduceMotion = useReducedMotion()
  return <motion.main className={className} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>{children}</motion.main>
}

export function RoadmapsMotionItem({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion()
  return <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay, ease }}>{children}</motion.div>
}

export function RoadmapsMotionSection({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduceMotion = useReducedMotion()
  return <motion.section className={className} initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay, ease }}>{children}</motion.section>
}

export function RoadmapsMotionCard({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const reduceMotion = useReducedMotion()
  return <motion.div className="h-full" initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} whileHover={reduceMotion ? undefined : { y: -5, scale: 1.01 }} whileTap={reduceMotion ? undefined : { scale: 0.99 }} transition={{ duration: 0.5, delay, ease }}>{children}</motion.div>
}
