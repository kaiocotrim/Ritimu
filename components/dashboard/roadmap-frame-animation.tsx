"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

const frames = Array.from(
  { length: 20 },
  (_, index) => `/teste/roadmap-frame-${String(index + 1).padStart(2, "0")}.png`,
)

const frameDuration = 350

export function RoadmapFrameAnimation() {
  const [activeFrame, setActiveFrame] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [firstFrameReady, setFirstFrameReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = containerRef.current?.closest("section")
    if (!card) return

    const startAnimation = () => setIsHovered(true)
    const stopAnimation = () => setIsHovered(false)
    card.addEventListener("pointerenter", startAnimation)
    card.addEventListener("pointerleave", stopAnimation)

    return () => {
      card.removeEventListener("pointerenter", startAnimation)
      card.removeEventListener("pointerleave", stopAnimation)
    }
  }, [])

  useEffect(() => {
    if (!isHovered) return

    const interval = window.setInterval(() => {
      setActiveFrame((currentFrame) => (currentFrame + 1) % frames.length)
    }, frameDuration)

    return () => window.clearInterval(interval)
  }, [isHovered])

  return (
    <div ref={containerRef} className="absolute inset-0 transition-transform duration-1000 ease-in-out group-hover:scale-[1.02]">
      {!firstFrameReady && (
        <div
          className="absolute inset-0 z-10 overflow-hidden bg-[#0a2027] animate-pulse motion-reduce:animate-none"
          aria-hidden="true"
        >
          <div className="absolute inset-x-[18%] top-1/2 h-4 -translate-y-5 bg-white/10" />
          <div className="absolute inset-x-[28%] top-1/2 h-3 translate-y-2 bg-white/[.07]" />
          <div className="absolute bottom-5 right-5 h-11 w-36 border-2 border-white/10 bg-white/[.08]" />
        </div>
      )}
      {frames.map((frame, index) => (
        <Image
          key={frame}
          src={frame}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          preload={index === 0}
          loading={index === 0 ? undefined : "eager"}
          onLoad={index === 0 ? () => setFirstFrameReady(true) : undefined}
          aria-hidden="true"
          className={`object-cover ${index === activeFrame ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <span className="sr-only">Próxima etapa do roadmap Full Stack Developer</span>
    </div>
  )
}
