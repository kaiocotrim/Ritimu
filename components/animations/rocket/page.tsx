"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function RocketLaunchIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <DotLottieReact
      src="/animations/Rocket.json"
      autoplay
      loop
      className={className}
    />
  )
}
