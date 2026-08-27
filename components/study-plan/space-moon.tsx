"use client"

import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"


export function SpaceMoon() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className="pointer-events-none absolute -bottom-8 left-1/2 z-[2] w-[115vw] max-w-none -translate-x-1/2 sm:-bottom-14 sm:w-[100vw]"
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <motion.div
        className="relative"
        animate={reduceMotion ? undefined : { y: [0, -5, 0, 4, 0], rotate: [0, 0.18, 0, -0.18, 0] }}
        transition={reduceMotion ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-x-[8%] bottom-[2%] h-[38%] rounded-[50%] bg-white/25 blur-3xl" />
        <Image
          src="/lua.png"
          alt=""
          width={2103}
          height={748}
          sizes="100vw"
          className="relative h-auto w-full drop-shadow-[0_0_24px_rgba(255,255,255,0.55)]"
          priority
        />
      </motion.div>
    </motion.div>
  )
}
