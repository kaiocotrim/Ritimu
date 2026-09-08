"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import { Maximize2, Minus, Plus } from "lucide-react"

export function RoadmapCanvas({ children }: { children: ReactNode }) {
  const [zoom, setZoom] = useState(1)
  return (
    <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-black/10 bg-[#fdfcf9] shadow-sm">
      <div className="absolute right-4 top-4 z-30 flex items-center gap-1 rounded-xl border border-black/10 bg-white/95 p-1 shadow-lg backdrop-blur">
        <button aria-label="Diminuir zoom" onClick={() => setZoom((value) => Math.max(.65, value - .1))} className="grid size-9 place-items-center rounded-lg hover:bg-black/5"><Minus className="size-4" /></button>
        <span className="w-12 text-center text-xs font-bold text-black/50">{Math.round(zoom * 100)}%</span>
        <button aria-label="Aumentar zoom" onClick={() => setZoom((value) => Math.min(1.25, value + .1))} className="grid size-9 place-items-center rounded-lg hover:bg-black/5"><Plus className="size-4" /></button>
        <button aria-label="Restaurar zoom" onClick={() => setZoom(1)} className="grid size-9 place-items-center rounded-lg hover:bg-black/5"><Maximize2 className="size-4" /></button>
      </div>
      <div className="overflow-auto px-4 pb-16 pt-24 sm:px-8">
        <div className="mx-auto w-[940px] transition-transform duration-200" style={{ transform: `scale(${zoom})`, transformOrigin: "top center", marginBottom: `${(zoom - 1) * 100}%` }}>
          {children}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1.5 text-[11px] font-medium text-white sm:hidden">Arraste para explorar o mapa</div>
    </div>
  )
}
