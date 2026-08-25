"use client"

import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { useEffect, useState } from "react"

const COMPLETION_CONFETTI_KEY = "ritimu:show-completion-confetti"

export function CompletionConfetti() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(COMPLETION_CONFETTI_KEY) !== "true") return

    sessionStorage.removeItem(COMPLETION_CONFETTI_KEY)
    const showTimer = window.setTimeout(() => setVisible(true), 0)
    const hideTimer = window.setTimeout(() => setVisible(false), 2200)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-3xl"
      aria-hidden="true"
    >
      <DotLottieReact
        src="/animations/success-confetti.json"
        autoplay
        loop={false}
        className="h-full w-full"
      />
    </div>
  )
}
