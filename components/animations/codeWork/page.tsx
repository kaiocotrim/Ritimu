"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function CodeWork({ className = "h-15 w-15" }: { className?: string }) {
  return (
    <DotLottieReact
      src="/animations/CoderWork.json"
      autoplay
      loop
      className={className}
    />
  )
}
