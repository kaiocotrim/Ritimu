"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

const frames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 9, 8, 7, 6, 5, 4, 3, 2].map(
  (frame) => `/boneco/bot%20(${frame}).png`
)

export function LostMascot() {
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
      className="pointer-events-none absolute left-0 top-[18%] z-[2] w-10 will-change-transform sm:w-12 lg:w-16"
      initial={reduceMotion ? { x: "82vw", y: 40 } : { x: "-10vw", y: 0, rotate: -14 }}
      animate={
        reduceMotion
          ? { x: "82vw", y: 40 }
          : {
              x: ["-10vw", "24vw", "62vw", "108vw"],
              y: [0, 90, 20, 150],
              rotate: [0, 120, 240, 360],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration: 26, times: [0, 0.34, 0.68, 1], repeat: Infinity, repeatDelay: 0, ease: "linear" }
      }
      aria-hidden="true"
    >
      <div className="relative aspect-[258/295] w-full overflow-hidden">
        <motion.div
          key={frames[frameIndex]}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0.35, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Image
            src={frames[frameIndex]}
            alt=""
            fill
            sizes="64px"
            className="object-contain object-center"
            priority={frameIndex === 0}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
