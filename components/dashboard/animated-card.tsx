"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

type AnimatedCardProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
}: AnimatedCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      className={`cursor-pointer ${className ?? ""}`}
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={
        reduceMotion
          ? undefined
          : { scale: 1.008, transition: { duration: 0.35, ease: "easeOut" } }
      }
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  )
}

export function AnimatedItem({
  children,
  className,
  delay = 0,
}: AnimatedCardProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`cursor-pointer ${className ?? ""}`}
      initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={
        reduceMotion
          ? undefined
          : { scale: 1.008, transition: { duration: 0.35, ease: "easeOut" } }
      }
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
