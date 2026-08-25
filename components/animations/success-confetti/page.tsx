"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

type SuccessConfettiIconProps = {
  className?: string
}

export function SuccessConfettiIcon({
  className = "h-14 w-14",
}: SuccessConfettiIconProps) {
  return (
    <DotLottieReact
      src="/animations/success-confetti.json"
      autoplay
      loop={false}
      className={className}
    />
  )
}