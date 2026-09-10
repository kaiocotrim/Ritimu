"use client"

import { type ReactNode, useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  Brain,
  Flag,
  Gamepad2,
  Home,
  LogOut,
  Map,
  Trophy,
  User,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RoadmapDrawerContext } from "./roadmap-drawer-context"

const navigationItems = [
  { href: "/dashboard", label: "Início", Icon: Home },
  { href: "/disciplinas", label: "Matérias", Icon: BookOpen },
  { href: "/metas", label: "Missões", Icon: Flag },
  { href: "/plano-de-estudos", label: "Meu plano", Icon: Brain },
  { href: "/roadmaps", label: "Roadmaps", Icon: Map },
  { href: "/ranking", label: "Ranking", Icon: Trophy },
  { href: "/x1", label: "X1", Icon: Gamepad2 },
  { href: "/perfil", label: "Perfil", Icon: User },
]

export function RoadmapLayoutClient({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  // Close drawer when path changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <RoadmapDrawerContext.Provider value={{ isOpen, open, close, toggle }}>
      {/* Backdrop */}
      <div
        onClick={close}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-50 bg-black/55 backdrop-blur-xs transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Drawer sidebar */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navegação do roadmap"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 sm:w-80 max-w-[85vw] flex-col overflow-y-auto border-r border-white/10 bg-[#071d31] bg-[url('/bannerLateral.png')] bg-contain bg-bottom bg-no-repeat px-4 py-5 text-white shadow-[12px_0_35px_rgba(4,20,31,.35)] transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between gap-3 pb-4">
          <Link href="/dashboard" onClick={close} className="flex items-center gap-2">
            <Image
              src="/logo-ritimu-white.png"
              alt="RITIMU"
              width={116}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={close}
            className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/75 transition hover:bg-white/15 hover:text-white"
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Exit Roadmap Button */}
        <Link
          href="/dashboard"
          onClick={close}
          className="font-pixel relative z-10 mb-4 mt-2 flex shrink-0 items-center justify-center gap-2 border-2 border-[#d49a32] bg-[#2f7d3c] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_#101712] transition-colors hover:bg-[#45b950]"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span>Sair do Roadmap</span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 py-1" aria-label="Navegação do Ritimu">
          {navigationItems.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`)

            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white/15 text-[#50D05C] font-semibold"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer quote */}
        <div className="relative mt-auto min-h-22 overflow-hidden border-2 border-[#75e8dc]/35 bg-[#051726]/80 shadow-[4px_4px_0_rgba(0,8,16,.55)]">
          <p className="font-pixel relative z-10 px-4 py-5 text-[11px] font-bold uppercase leading-5 tracking-wider text-[#a0ffc5] drop-shadow-[0_1px_2px_rgba(0,20,28,.8)]">
            Disciplina hoje
            <br />
            constrói o seu amanhã.
          </p>
        </div>
      </aside>

      {/* Main page content */}
      {children}
    </RoadmapDrawerContext.Provider>
  )
}
