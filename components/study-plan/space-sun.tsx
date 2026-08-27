"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

const frames = [1, 2, 3, 4, 5, 6].map((frame) => `/sol/sol${frame}.png`)

export function SpaceSun() {
  const reduceMotion = useReducedMotion()
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length)
    }, 2200)
    return () => window.clearInterval(interval)
  }, [reduceMotion])

  return (
    <motion.div
      className="pointer-events-none absolute -left-12 -top-12 z-[2] w-36 sm:-left-16 sm:-top-16 sm:w-44 lg:-left-14 lg:-top-14 lg:w-52"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <motion.div
        className="relative aspect-square w-full"
        animate={reduceMotion ? undefined : { y: [0, -6, 0, 5, 0], rotate: [0, 0.7, 0, -0.7, 0] }}
        transition={reduceMotion ? undefined : { duration: 11, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute inset-[10%] rounded-full bg-orange-500/60 blur-3xl" />
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={frames[frameIndex]}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 1.015 }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
          >
            <Image
              src={frames[frameIndex]}
              alt=""
              fill
              sizes="208px"
              className="object-contain object-center drop-shadow-[0_0_32px_rgba(255,132,0,0.9)]"
              priority={frameIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
