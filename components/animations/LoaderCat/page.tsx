"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function LoaderCatIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <DotLottieReact
      src="/animations/LoaderCat.json"
      autoplay
      loop
      className={className}
    />
  )
}
