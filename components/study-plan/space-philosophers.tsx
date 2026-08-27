"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { MoonAristotle } from "@/components/study-plan/moon-aristotle"
import { MoonEinstein } from "@/components/study-plan/moon-einstein"

export function SpacePhilosophers() {
  const reduceMotion = useReducedMotion()
  const [activeCharacter, setActiveCharacter] = useState<"einstein" | "aristotle">("einstein")

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveCharacter((current) => (current === "einstein" ? "aristotle" : "einstein"))
    }, 32000)

    return () => window.clearInterval(interval)
  }, [])

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeCharacter}
        className="absolute inset-0"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.55, ease: "easeInOut" }}
      >
        {activeCharacter === "einstein" ? <MoonEinstein /> : <MoonAristotle />}
      </motion.div>
    </AnimatePresence>
  )
}
