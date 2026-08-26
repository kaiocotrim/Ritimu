"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"

export function LoaderCatIcon() {
  return (
    <DotLottieReact
      src="/animations/LoaderCat.json"
      autoplay
      loop
      className="h-10 w-10"
    />
  )
}