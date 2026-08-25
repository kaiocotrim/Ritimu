"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Flag, Home, Trophy, User } from "lucide-react"

const navigationItems = [
  { href: "/dashboard", label: "Início", Icon: Home },
  { href: "/disciplinas", label: "Matérias", Icon: BookOpen },
  { href: "/metas", label: "Missões", Icon: Flag },
  { href: "/ranking", label: "Ranking", Icon: Trophy },
  { href: "/perfil", label: "Perfil", Icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-8 z-20 mx-auto flex w-fit items-center gap-1 rounded-full border border-white/70 bg-white/25 px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-black/5 backdrop-blur-md backdrop-saturate-150 transition-all duration-300 hover:border-black/5 hover:bg-white hover:shadow-lg hover:shadow-black/5 hover:backdrop-blur-none hover:backdrop-saturate-100"
    >
      {navigationItems.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "text-[#50D05C]"
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
