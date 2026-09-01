"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Brain, Flag, Gamepad2, Home, Trophy, User } from "lucide-react"

const navigationItems = [
  { href: "/dashboard", label: "Início", Icon: Home },
  { href: "/disciplinas", label: "Matérias", Icon: BookOpen },
  { href: "/metas", label: "Missões", Icon: Flag },
  { href: "/plano-de-estudos", label: "Meu plano", Icon: Brain },
  { href: "/ranking", label: "Ranking", Icon: Trophy },
  { href: "/x1", label: "X1", Icon: Gamepad2 },
  { href: "/perfil", label: "Perfil", Icon: User },
]

export function Sidebar({ variant }: { variant?: "light" | "dark" }) {
  const pathname = usePathname()
  const isDarkPage = variant ? variant === "dark" : pathname === "/plano-de-estudos" || pathname.startsWith("/plano-de-estudos/")

  return (
    <nav
      aria-label="Navegação principal"
      className={`fixed inset-x-2 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-20 mx-auto flex w-fit max-w-[calc(100vw-1rem)] items-center gap-1 overflow-x-auto rounded-full border px-2 py-2 backdrop-blur-md backdrop-saturate-150 transition-all duration-300 sm:inset-x-0 sm:bottom-8 sm:px-3 sm:py-2.5 ${
        isDarkPage
          ? "border-white/10 bg-[#171922]/85 shadow-[0_10px_35px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.08)] ring-1 ring-white/5 hover:bg-[#1D202A]"
          : "border-white/70 bg-white/25 shadow-[0_10px_30px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-black/5 hover:border-black/5 hover:bg-white hover:shadow-lg hover:shadow-black/5 hover:backdrop-blur-none hover:backdrop-saturate-100"
      }`}
    >
      {navigationItems.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
              isActive
                ? "text-[#50D05C]"
                : isDarkPage
                  ? "text-white/45 hover:text-white/80"
                  : "text-black/50 hover:text-black/80"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
