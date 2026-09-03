"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Crown } from "lucide-react"

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
  const medalSrc = position === 1
    ? "/medalhas_8bit_png/medalha_ouro_8bit.png"
    : position === 2
      ? "/medalhas_8bit_png/medalha_prata_8bit.png"
      : "/medalhas_8bit_png/medalha_bronze_8bit.png"
  const wingsSrc = position === 1
    ? "/asas/ouro.png"
    : position === 2
      ? "/asas/prata.png"
      : "/asas/bronze.png"
  const cardStyle = position === 1
    ? "border-amber-400/80 bg-[radial-gradient(circle_at_50%_28%,rgba(245,158,11,.20),rgba(24,17,5,.97)_65%)] shadow-amber-400/20 ring-1 ring-amber-300/25"
    : position === 2
      ? "border-sky-300/35 bg-[radial-gradient(circle_at_50%_28%,rgba(125,211,252,.13),rgba(9,17,23,.97)_65%)] shadow-sky-300/10"
      : "border-orange-500/35 bg-[radial-gradient(circle_at_50%_28%,rgba(194,90,28,.15),rgba(23,15,10,.97)_65%)] shadow-orange-500/10"

  useEffect(() => {
    if (!isChampion || !cardEntered) return
    const timeout = window.setTimeout(() => setShowConfetti(true), 2000)
    return () => window.clearTimeout(timeout)
  }, [cardEntered, isChampion])

  return (
    <div className={isChampion ? "sm:-translate-y-3" : undefined}>
      <AnimatedItem
        delay={delay}
        onAnimationComplete={() => setCardEntered(true)}
        className={`relative flex h-full min-h-[220px] flex-col items-center overflow-hidden rounded-2xl border px-5 pb-5 pt-7 text-center shadow-xl ${cardStyle}`}
      >
        <Image
          src={wingsSrc}
          alt=""
          aria-hidden="true"
          width={480}
          height={393}
          className={`pointer-events-none absolute left-1/2 top-6 z-0 w-48 -translate-x-1/2 object-contain [image-rendering:pixelated] ${isChampion ? "opacity-20" : "opacity-[.12]"}`}
        />
        <Image
          src={medalSrc}
          alt={`Medalha de ${position}º lugar`}
          width={64}
          height={64}
          className="absolute -left-1 -top-0.5 z-30 size-16 object-contain [image-rendering:pixelated] drop-shadow-[0_8px_12px_rgba(0,0,0,.4)]"
        />

        {isChampion && showConfetti && <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true"><Confetti /></div>}
        {isChampion && <Crown className="relative z-20 mb-1 size-6 fill-amber-300 text-amber-400 drop-shadow-[0_0_10px_rgba(250,204,21,.55)]" aria-hidden="true" />}
        <div className={`relative z-20 flex size-14 items-center justify-center rounded-full border-2 border-white/15 text-lg font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,.35)] ${color}`}>
          {initials}
        </div>

        {isChampion && (
          <div className="absolute right-2 top-1 z-20 scale-75" aria-hidden="true">
            <TrophyIcon play={cardEntered} />
          </div>
        )}

        <span className="relative z-20 mt-3 text-[10px] font-semibold uppercase tracking-[.14em] text-white/45">{position}º lugar</span>
        <h2 className="relative z-20 mt-1 max-w-full truncate text-base font-bold text-white">{name}</h2>
        <p className={`relative z-20 mt-3 text-base font-extrabold tabular-nums tracking-wide ${
          isChampion
            ? "text-amber-300"
            : position === 2
              ? "text-sky-300"
              : "text-orange-300"
        }`}>
          {xp.toLocaleString("pt-BR")} XP
        </p>
      </AnimatedItem>
    </div>
  )
}
