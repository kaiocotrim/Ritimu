"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

const frames = Array.from(
  { length: 9 },
  (_, index) => `/et/ET%20(${index + 1}).png`
)

export function SpaceAlien() {
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
      className="pointer-events-none absolute right-0 top-[58%] z-[3] w-20 will-change-transform sm:w-24 lg:w-28"
      initial={reduceMotion ? { x: "-8vw", y: 0 } : { x: "14vw", y: 80, rotate: 4 }}
      animate={
        reduceMotion
          ? { x: "-8vw", y: 0 }
          : {
              x: ["14vw", "-26vw", "-66vw", "-116vw"],
              y: [80, 10, -55, -120],
              rotate: [4, -2, 3, -5],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : { duration: 24, times: [0, 0.34, 0.68, 1], repeat: Infinity, repeatDelay: 0, ease: "linear" }
      }
      aria-hidden="true"
    >
      <div className="relative aspect-[335/218] w-full">
        <motion.div
          key={frames[frameIndex]}
          className="absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0.35, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          <Image
            src={frames[frameIndex]}
            alt=""
            fill
            sizes="112px"
            className="object-contain object-center"
            priority={frameIndex === 0}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
