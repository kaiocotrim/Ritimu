"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import type { DotLottie } from "@lottiefiles/dotlottie-web"
import { useCallback, useRef } from "react"

export function InteractiveStatIcon({ src, label, className = "size-14", loop = false, tone = "lime" }: {
  src: string
  label: string
  className?: string
  loop?: boolean
  tone?: "lime" | "amber" | "orange"
}) {
  const playerRef = useRef<DotLottie | null>(null)
  const setPlayer = useCallback((player: DotLottie | null) => {
    playerRef.current = player
    player?.play()
  }, [])

  function replay() {
    const player = playerRef.current
    if (!player) return
    player.setFrame(0)
    player.play()
  }

  const toneClass = tone === "amber"
    ? "bg-amber-400/10 shadow-[0_0_22px_rgba(251,191,36,0.12)]"
    : tone === "orange"
      ? "bg-orange-400/10 shadow-[0_0_22px_rgba(251,146,60,0.12)]"
      : "bg-lime-400/10 shadow-[0_0_22px_rgba(163,230,53,0.12)]"

  return (
    <span role="img" aria-label={label} tabIndex={0} onPointerEnter={replay} onFocus={replay}
      className={`inline-flex shrink-0 cursor-pointer items-center justify-center rounded-2xl outline-none transition-transform duration-200 hover:scale-110 focus-visible:scale-110 focus-visible:ring-2 focus-visible:ring-white/60 ${toneClass}`}>
      <DotLottieReact src={src} autoplay loop={loop} dotLottieRefCallback={setPlayer} className={className} />
    </span>
  )
}
