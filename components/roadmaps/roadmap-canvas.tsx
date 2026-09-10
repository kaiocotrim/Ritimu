"use client"

import type { PointerEvent as ReactPointerEvent, ReactNode, WheelEvent as ReactWheelEvent } from "react"
import { useEffect, useRef, useState } from "react"
import { Maximize2, Minimize2, Minus, Plus, RotateCcw } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const MIN_ZOOM = 0.05
const MAX_ZOOM = 20

export function RoadmapCanvas({ children, width = 940, height }: { children: ReactNode; width?: number; height?: number }) {
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [pan, setPan] = useState({ x: 32, y: 96 })
  const viewportRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  function beginDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button, a, input, textarea, select")) return
    const viewport = viewportRef.current
    if (!viewport) return
    dragOrigin.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }
    setDragging(true)
    viewport.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    const viewport = viewportRef.current
    if (!viewport) return
    setPan({
      x: dragOrigin.current.panX + event.clientX - dragOrigin.current.x,
      y: dragOrigin.current.panY + event.clientY - dragOrigin.current.y,
    })
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    viewportRef.current?.releasePointerCapture(event.pointerId)
    setDragging(false)
  }

  function zoomWithWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const viewport = viewportRef.current
    if (!viewport || event.deltaY === 0) return
    const bounds = viewport.getBoundingClientRect()
    const pointerX = event.clientX - bounds.left
    const pointerY = event.clientY - bounds.top
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * (event.deltaY < 0 ? 1.12 : 1 / 1.12)))
    if (nextZoom === zoom) return
    const ratio = nextZoom / zoom
    setPan({
      x: pointerX - (pointerX - pan.x) * ratio,
      y: pointerY - (pointerY - pan.y) * ratio,
    })
    setZoom(nextZoom)
  }

  function resetView() {
    setZoom(1)
    setPan({ x: 32, y: 96 })
  }

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
    <div className={cn("roadmap-dot-grid relative overflow-hidden border border-black/10 bg-[#fdfcf9] shadow-sm", fullscreen ? "fixed inset-0 z-100 m-0 rounded-none" : "mt-8 rounded-[2rem]")}>
      <div className="pointer-events-none absolute left-4 top-4 z-30 w-[min(48vw,310px)] sm:left-6 sm:top-5">
        <Image src="/logoDosConceitos/logo2.png" alt="Ritimu — Roadmap de estudos Full Stack Developer" width={543} height={181} priority className="h-auto w-full object-contain" />
      </div>
      <div className="absolute right-4 top-4 z-30 flex items-center gap-1 rounded-xl border border-black/10 bg-white/95 p-1 shadow-lg backdrop-blur">
        <button aria-label="Diminuir zoom" onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value / 1.15))} className="grid size-9 place-items-center rounded-lg hover:bg-black/5"><Minus className="size-4" /></button>
        <span className="w-12 text-center text-xs font-bold text-black/50">{Math.round(zoom * 100)}%</span>
        <button aria-label="Aumentar zoom" onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value * 1.15))} className="grid size-9 place-items-center rounded-lg hover:bg-black/5"><Plus className="size-4" /></button>
        <button aria-label="Centralizar mapa" title="Centralizar mapa" onClick={resetView} className="grid size-9 place-items-center rounded-lg hover:bg-black/5"><RotateCcw className="size-4" /></button>
        <button aria-label={fullscreen ? "Sair da tela cheia" : "Abrir em tela cheia"} title={fullscreen ? "Sair da tela cheia" : "Tela cheia"} aria-pressed={fullscreen} onClick={() => setFullscreen((value) => !value)} className="grid size-9 place-items-center rounded-lg hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-blue-500">{fullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}</button>
      </div>
      <div
        ref={viewportRef}
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onWheel={zoomWithWheel}
        className={cn("relative select-none overflow-hidden touch-none", dragging ? "cursor-grabbing" : "cursor-grab", fullscreen ? "h-screen" : "h-[75vh] min-h-120")}
      >
        <div className="absolute left-0 top-0" style={{ width, height, transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-medium text-white">Arraste para mover · use a roda para dar zoom</div>
    </div>
  )
}
