"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, useReducedMotion } from "motion/react"

const frames = Array.from(
  { length: 12 },
  (_, index) => `/agenda/agenda${index + 1}.png`
)

export function FloatingAgenda() {
  const reduceMotion = useReducedMotion()
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    if (reduceMotion) return

    const interval = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length)
    }, 650)

    return () => window.clearInterval(interval)
  }, [reduceMotion])

  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 left-0 z-[2] w-9 will-change-transform sm:w-10 lg:w-12"
      initial={reduceMotion ? { x: "72vw", y: "-35vh" } : { x: "48vw", y: "14vh", rotate: -8 }}
      animate={
        reduceMotion
          ? { x: "72vw", y: "-35vh" }
          : {
              x: ["48vw", "58vw", "47vw", "62vw"],
              y: ["14vh", "-24vh", "-66vh", "-112vh"],
              rotate: [-8, 4, -3, 7],
            }
      }
      transition={
        reduceMotion
          ? undefined
          : {
              duration: 32,
              times: [0, 0.34, 0.68, 1],
              repeat: Infinity,
              ease: "linear",
            }
      }
      aria-hidden="true"
    >
      <div className="relative aspect-[350/276] w-full">
        <Image
          key={frames[frameIndex]}
          src={frames[frameIndex]}
          alt=""
          fill
          sizes="48px"
          className="object-contain object-center"
          priority={frameIndex === 0}
        />
      </div>
    </motion.div>
  )
}
