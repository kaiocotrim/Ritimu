"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

type InteractiveProgressProps = {
  progress: number
  radius?: number
}

export function InteractiveProgress({ progress, radius = 88 }: InteractiveProgressProps) {
  const [hovered, setHovered] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress / 100)
  // O SVG inteiro já está rotacionado em -90°, então o ponto final deve ser
  // calculado a partir da posição original do círculo (3 horas).
  const angle = (progress / 100) * Math.PI * 2
  const dotX = 100 + radius * Math.cos(angle)
  const dotY = 100 + radius * Math.sin(angle)

  useEffect(() => {
    const card = rootRef.current?.closest("section")
    if (!card) return

    const handleEnter = () => setHovered(true)
    const handleLeave = () => setHovered(false)

    card.addEventListener("pointerenter", handleEnter)
    card.addEventListener("pointerleave", handleLeave)

    return () => {
      card.removeEventListener("pointerenter", handleEnter)
      card.removeEventListener("pointerleave", handleLeave)
    }
  }, [])

  return (
    <div
      ref={rootRef}
      className="absolute inset-0"
      role="progressbar"
      aria-label="Foco do dia"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <motion.svg
        viewBox="0 0 200 200"
        className="h-full w-full -rotate-90"
        animate={reduceMotion ? undefined : { scale: hovered ? 1.035 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="14"
        />
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="#C9F223"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={reduceMotion ? false : { strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset:
              hovered && !reduceMotion
                ? [dashOffset, circumference, dashOffset]
                : dashOffset,
            filter: hovered
              ? "drop-shadow(0 0 7px rgba(201, 242, 35, 0.8))"
              : "drop-shadow(0 0 0 rgba(201, 242, 35, 0))",
          }}
          transition={{ duration: hovered ? 0.9 : 0.75, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.circle
          cx={dotX}
          cy={dotY}
          r="5.5"
          fill="#C9F223"
          stroke="white"
          strokeWidth="2"
          animate={hovered && !reduceMotion ? { scale: [1, 1.45, 1] } : { scale: 1 }}
          transition={
            hovered
              ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.2 }
          }
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      </motion.svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold transition-colors duration-700 group-hover:text-white">{progress}%</span>
        <span className="mt-1 text-sm text-black/50 transition-colors duration-700 group-hover:text-white/70">Foco do dia</span>
      </div>
    </div>
  )
}
