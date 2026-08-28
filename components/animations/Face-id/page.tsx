"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

type FaceIDProps = {
  className?: string
  loop?: boolean
}

export function FaceID({ className = "h-8 w-8", loop = true }: FaceIDProps) {
  return (
    <DotLottieReact
      src="/animations/Face-ID.json"
      autoplay
      loop={loop}
      className={className}
    />
  )
}
