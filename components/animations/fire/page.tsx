"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function FireIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <DotLottieReact
      src="/animations/Fire.json"
      autoplay
      loop
      className={className}
    />
  )
}
