"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function TrophyIcon() {
  return (
    <DotLottieReact
      src="/animations/Trophy.json"
      autoplay
      loop={false}
      className="h-18 w-18"
    />
  )
}