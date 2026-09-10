"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Menu } from "lucide-react"
import { useRoadmapDrawer } from "./roadmap-drawer-context"
import { cn } from "@/lib/utils"

interface RoadmapTopBarProps {
  backHref?: string
  backLabel?: string
  className?: string
}

export function RoadmapTopBar({
  backHref,
  backLabel,
  className,
}: RoadmapTopBarProps) {
  const { open } = useRoadmapDrawer()

  return (
    <div className={cn("flex flex-wrap items-center gap-3.5 sm:gap-5", className)}>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={open}
        className="grid size-10 place-items-center rounded-lg border border-black/15 bg-white text-[#111820] shadow-xs transition hover:border-black/25 hover:bg-black/5 active:scale-95"
        aria-label="Abrir menu de navegação"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {/* RITIMU Brand */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 transition hover:opacity-85"
        aria-label="Página inicial do Ritimu"
      >
        <Image
          src="/logo-ritimu-trimmed.png"
          alt="RITIMU"
          width={116}
          height={32}
          priority
          className="h-8 w-auto object-contain"
        />
      </Link>

      {/* Back link when provided */}
      {backHref && (
        <Link
          href={backHref}
          className="font-pixel ml-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black/55 transition hover:text-black sm:ml-4"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          <span>{backLabel || "Todos os roadmaps"}</span>
        </Link>
      )}
    </div>
  )
}
