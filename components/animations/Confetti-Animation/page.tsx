"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function Confetti({ className = "h-full w-full" }: { className?: string }) {
  return (
    <DotLottieReact
      src="/animations/Confetti-Animation.json"
      autoplay
      loop={false}
      className={className}
    />
  )
}
  