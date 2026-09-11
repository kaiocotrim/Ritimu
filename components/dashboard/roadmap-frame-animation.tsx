"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { RoadmapCardSkeleton } from "@/components/dashboard/roadmap-card-skeleton"

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
        <div className="absolute inset-0 z-10"><RoadmapCardSkeleton /></div>
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
