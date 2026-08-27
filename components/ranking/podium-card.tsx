"use client"

import { useEffect, useState } from "react"

import { Confetti } from "@/components/animations/Confetti-Animation/page"
import { TrophyIcon } from "@/components/animations/Trophy/page"
import { AnimatedItem } from "@/components/dashboard/animated-card"

type PodiumCardProps = {
  name: string
  xp: number
  initials: string
  color: string
  position: number
  delay: number
}

export function PodiumCard({ name, xp, initials, color, position, delay }: PodiumCardProps) {
  const [cardEntered, setCardEntered] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const isChampion = position === 1

  useEffect(() => {
    if (!isChampion || !cardEntered) return
    const timeout = window.setTimeout(() => setShowConfetti(true), 2000)
    return () => window.clearTimeout(timeout)
  }, [cardEntered, isChampion])

  return (
    <div className={isChampion ? "sm:-translate-y-2" : undefined}>
      <AnimatedItem
        delay={delay}
        onAnimationComplete={() => setCardEntered(true)}
        className={`relative flex h-full flex-col items-center overflow-hidden rounded-3xl border bg-white p-6 text-center shadow-sm ${
          isChampion ? "border-[#50D05C]/40" : "border-black/5"
        }`}
      >
        {isChampion && showConfetti && <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true"><Confetti /></div>}
        <div className={`relative z-20 flex size-16 items-center justify-center rounded-full text-lg font-bold text-white ${color}`}>
          {initials}
        </div>
        {isChampion && (
          <div className="relative z-20 mt-2" aria-hidden="true">
            <TrophyIcon play={cardEntered} />
          </div>
        )}
        <span className="relative z-20 mt-3 text-xs font-semibold uppercase tracking-wider text-black/35">
          {position}º lugar
        </span>
        <h2 className="relative z-20 mt-1 font-semibold">{name}</h2>
        <p className="relative z-20 mt-1 text-sm font-bold text-[#45B950]">
          {xp.toLocaleString("pt-BR")} XP
        </p>
      </AnimatedItem>
    </div>
  )
}
