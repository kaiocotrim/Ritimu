"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

const frames = Array.from({ length: 8 }, (_, index) => `/foguete_8_frames_png/foguete${index + 1}.png`)

export function LoginRocket() {
  const reduceMotion = useReducedMotion()
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion) return
    const interval = window.setInterval(() => setFrameIndex((current) => (current + 1) % frames.length), 4000)
    return () => window.clearInterval(interval)
  }, [reduceMotion])

  return <motion.div
    className="pointer-events-none absolute left-0 top-[22%] z-0 w-28 will-change-transform sm:w-36 lg:w-44"
    initial={reduceMotion ? { x: "70vw", y: 0 } : { x: "112vw", y: 0, rotate: 0 }}
    animate={reduceMotion ? { x: "70vw", y: 0 } : { x: ["112vw", "68vw", "25vw", "-18vw"], y: 0, rotate: 0 }}
    transition={reduceMotion ? undefined : { duration: 28, times: [0, .34, .68, 1], repeat: Infinity, ease: "linear" }}
    aria-hidden="true"
  >
    <div className="relative aspect-[370/250] w-full">
      <motion.div key={frames[frameIndex]} className="absolute inset-0" initial={reduceMotion ? false : { opacity: .35, scale: .97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .55 }}>
        <Image src={frames[frameIndex]} alt="" fill sizes="176px" className="object-contain [image-rendering:pixelated]" priority={frameIndex === 0} />
      </motion.div>
    </div>
  </motion.div>
}
