"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

const frames = Array.from(
  { length: 12 },
  (_, index) => `/frames_aristoteles/aristoteles${index + 1}.png`
)

export function MoonAristotle() {
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
      className="pointer-events-none absolute left-0 top-[72%] z-[3] w-[59px] will-change-transform sm:w-[75px] lg:w-[91px]"
      initial={reduceMotion ? { x: "24vw", y: -10 } : { x: "-14vw", y: 20, rotate: -5 }}
      animate={
        reduceMotion
          ? { x: "24vw", y: -10 }
          : {
              x: ["-14vw", "28vw", "69vw", "112vw"],
              y: [20, -50, 25, -35],
              rotate: [0, -120, -240, -360],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration: 32, times: [0, 0.34, 0.68, 1], ease: "linear" }
      }
      aria-hidden="true"
    >
      <motion.div
        className="relative aspect-[384/342] w-full overflow-hidden rounded-full"
        animate={reduceMotion ? undefined : { y: [0, 2, 0, -3, 0], rotate: [0, 1, 0, -1, 0] }}
        transition={reduceMotion ? undefined : { duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          key={frames[frameIndex]}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0.35, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <Image
            src={frames[frameIndex]}
            alt=""
            fill
            sizes="91px"
            className="object-contain"
            priority={frameIndex === 0}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
