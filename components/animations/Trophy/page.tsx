"use client"

import { useCallback, useEffect, useRef } from "react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import type { DotLottie } from "@lottiefiles/dotlottie-web"

type TrophyIconProps = {
  play?: boolean
}

export function TrophyIcon({ play = true }: TrophyIconProps) {
  const playerRef = useRef<DotLottie | null>(null)

  const setPlayer = useCallback((player: DotLottie | null) => {
    playerRef.current = player

    if (player && play) {
      player.play()
    }
  }, [play])

  useEffect(() => {
    if (play) {
      playerRef.current?.play()
    }
  }, [play])

  return (
    <DotLottieReact
      src="/animations/Trophy.json"
      autoplay={false}
      loop={false}
      dotLottieRefCallback={setPlayer}
      className="h-18 w-18"
    />
  )
}
