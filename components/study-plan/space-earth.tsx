"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

const frames = [1, 2, 3, 4].map((frame) => `/terra/terra-top-${frame}.png`)

export function SpaceEarth() {
  const reduceMotion = useReducedMotion()
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length)
    }, 4000)
    return () => window.clearInterval(interval)
  }, [reduceMotion])

  return (
    <motion.div
      className="pointer-events-none absolute right-0 top-0 z-[2] w-52 will-change-transform sm:w-56 lg:w-64"
      animate={reduceMotion ? undefined : { y: [0, -8, 0, 7, 0], rotate: [0, 0.7, 0, -0.7, 0] }}
      transition={reduceMotion ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <div className="relative aspect-[333/366] w-full">
        <div className="absolute inset-[12%] rounded-full bg-sky-400/35 blur-3xl" />
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
              sizes="256px"
              className="object-contain object-center drop-shadow-[0_0_26px_rgba(56,189,248,0.7)]"
              priority={frameIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
