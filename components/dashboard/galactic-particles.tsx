"use client"

import { motion, useReducedMotion } from "motion/react"

const particles = [
  { left: 6, top: 18, x: 34, y: 42, size: 2, duration: 3.8, delay: 0.1 },
  { left: 13, top: 72, x: -18, y: -38, size: 3, duration: 5.2, delay: 0.7 },
  { left: 21, top: 38, x: 46, y: -22, size: 2, duration: 4.4, delay: 1.2 },
  { left: 29, top: 84, x: 20, y: -55, size: 2, duration: 5.7, delay: 0.4 },
  { left: 37, top: 14, x: -26, y: 48, size: 3, duration: 4.9, delay: 1.8 },
  { left: 45, top: 57, x: 39, y: 26, size: 2, duration: 3.6, delay: 0.9 },
  { left: 52, top: 28, x: -32, y: 46, size: 2, duration: 5.5, delay: 1.4 },
  { left: 61, top: 79, x: 26, y: -49, size: 3, duration: 4.2, delay: 0.2 },
  { left: 69, top: 11, x: 18, y: 58, size: 2, duration: 5.9, delay: 1.1 },
  { left: 76, top: 46, x: -42, y: -28, size: 2, duration: 4.6, delay: 0.6 },
  { left: 84, top: 24, x: 24, y: 43, size: 3, duration: 5.1, delay: 1.6 },
  { left: 92, top: 68, x: -37, y: -34, size: 2, duration: 3.9, delay: 0.3 },
  { left: 18, top: 9, x: 51, y: 19, size: 1.5, duration: 6.1, delay: 2 },
  { left: 33, top: 49, x: -21, y: 37, size: 1.5, duration: 4.7, delay: 1 },
  { left: 57, top: 91, x: -12, y: -62, size: 1.5, duration: 5.4, delay: 1.7 },
  { left: 73, top: 66, x: 35, y: -45, size: 1.5, duration: 4.1, delay: 0.8 },
]

export function GalacticParticles({ alwaysVisible = false }: { alwaysVisible?: boolean }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`pointer-events-none absolute inset-0 z-[1] overflow-hidden transition-opacity duration-1000 ${alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      initial={alwaysVisible && !reduceMotion ? { opacity: 0 } : undefined}
      animate={alwaysVisible ? { opacity: 1 } : undefined}
      transition={alwaysVisible ? { duration: 1.1, delay: 0.35, ease: "easeOut" } : undefined}
      aria-hidden="true"
    >
      {[0, 1, 2].flatMap((layer) => particles.map((particle, index) => (
        <span
          key={`${layer}-${index}`}
          className="absolute rounded-full bg-white shadow-[0_0_7px_rgba(255,255,255,0.9)]"
          style={{
            left: `${(particle.left + layer * 31) % 96}%`,
            top: `${(particle.top + layer * 23) % 94}%`,
            width: particle.size - layer * 0.2,
            height: particle.size - layer * 0.2,
            opacity: 0.35 + ((index + layer) % 4) * 0.16,
          }}
        />
      )))}
    </motion.div>
  )
}
