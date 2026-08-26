"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function BlueLoading() {
  return (
    <DotLottieReact
      src="/animations/blue-loading.json"
      autoplay
      loop={false}
      className="h-20 w-20"
    />
  )
}