"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { Maximize2, Minimize2, Minus, Plus, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export function RoadmapCanvas({ children, width = 940, height }: { children: ReactNode; width?: number; height?: number }) {
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    if (!fullscreen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false)
    }
    window.addEventListener("keydown", closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", closeOnEscape)
    }
  }, [fullscreen])

  return (
    <div className={cn("relative overflow-hidden border border-black/10 bg-[#fdfcf9] shadow-sm", fullscreen ? "fixed inset-0 z-100 m-0 rounded-none" : "mt-8 rounded-[2rem]")}>
      <div className="absolute right-4 top-4 z-30 flex items-center gap-1 rounded-xl border border-black/10 bg-white/95 p-1 shadow-lg backdrop-blur">
        <button aria-label="Diminuir zoom" onClick={() => setZoom((value) => Math.max(.65, value - .1))} className="grid size-9 place-items-center rounded-lg hover:bg-black/5"><Minus className="size-4" /></button>
        <span className="w-12 text-center text-xs font-bold text-black/50">{Math.round(zoom * 100)}%</span>
        <button aria-label="Aumentar zoom" onClick={() => setZoom((value) => Math.min(1.25, value + .1))} className="grid size-9 place-items-center rounded-lg hover:bg-black/5"><Plus className="size-4" /></button>
        <button aria-label="Restaurar zoom" title="Restaurar zoom" onClick={() => setZoom(1)} className="grid size-9 place-items-center rounded-lg hover:bg-black/5"><RotateCcw className="size-4" /></button>
        <button aria-label={fullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"} title={fullscreen ? "Sair da tela cheia" : "Tela cheia"} aria-pressed={fullscreen} onClick={() => setFullscreen((value) => !value)} className="grid size-9 place-items-center rounded-lg hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-blue-500">{fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</button>
      </div>
      <div className={cn("overflow-auto px-4 pb-16 pt-24 sm:px-8", fullscreen ? "h-screen max-h-none" : "max-h-[75vh]")}>
        <div className="relative mx-auto transition-[width,height] duration-200" style={{ width: width * zoom, height: height ? height * zoom : undefined }}>
          <div className="absolute left-0 top-0 transition-transform duration-200" style={{ width, height, transform: `scale(${zoom})`, transformOrigin: "top left" }}>
            {children}
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1.5 text-[11px] font-medium text-white sm:hidden">Arraste para explorar o mapa</div>
    </div>
  )
}
