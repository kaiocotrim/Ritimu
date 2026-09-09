"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Brain, Flag, Gamepad2, Home, Map, Trophy, User, Zap } from "lucide-react"

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

export function Sidebar({ variant }: { variant?: "light" | "dark" }) {
  const pathname = usePathname()
  const isRoadmapPage = pathname === "/roadmaps" || pathname.startsWith("/roadmaps/")
  const isDarkPage = variant ? variant === "dark" : pathname === "/plano-de-estudos" || pathname.startsWith("/plano-de-estudos/")

  return (
    <nav
      data-ritimu-sidebar
      aria-label="Navegação principal"
      data-layout={isRoadmapPage ? "side" : "bottom"}
      className={`fixed inset-x-2 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-20 mx-auto flex w-fit max-w-[calc(100vw-1rem)] items-center gap-1 overflow-x-auto rounded-full border px-2 py-2 backdrop-blur-md backdrop-saturate-150 transition-all duration-300 sm:inset-x-0 sm:bottom-8 sm:px-3 sm:py-2.5 ${isRoadmapPage ? "xl:inset-y-0 xl:left-0 xl:right-auto xl:m-0 xl:h-screen xl:w-72 xl:max-w-none xl:flex-col xl:items-stretch xl:gap-1 xl:overflow-hidden xl:rounded-none xl:border-y-0 xl:border-l-0 xl:border-r xl:border-white/10 xl:bg-[#071d31] xl:bg-[url('/bannerLateral.png')] xl:bg-contain xl:bg-bottom xl:bg-no-repeat xl:px-4 xl:py-5 xl:text-white xl:shadow-[12px_0_35px_rgba(4,20,31,.16)] xl:backdrop-blur-none" : ""} ${
        isRoadmapPage
          ? "border-white/10 bg-[#041832] shadow-[0_10px_35px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.08)] ring-1 ring-white/5 hover:bg-[#041832]"
          : isDarkPage
            ? "border-white/10 bg-[#171922]/85 shadow-[0_10px_35px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.08)] ring-1 ring-white/5 hover:bg-[#1D202A]"
          : "border-white/70 bg-white/25 shadow-[0_10px_30px_rgba(0,0,0,0.12),inset_0_1px_1px_rgba(255,255,255,0.85)] ring-1 ring-black/5 hover:border-black/5 hover:bg-white hover:shadow-lg hover:shadow-black/5 hover:backdrop-blur-none hover:backdrop-saturate-100"
      }`}
    >
      {isRoadmapPage && <div className="hidden items-center gap-2 px-3 pb-7 pt-1 text-white xl:flex"><span className="grid size-10 place-items-center text-[#67e875]"><Zap className="size-9 fill-current" /></span><strong className="font-pixel text-2xl font-bold tracking-wider">RITIMU</strong></div>}
      {navigationItems.filter(({ href }) => isRoadmapPage || href !== "/roadmaps").map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${isRoadmapPage ? "xl:font-pixel xl:w-full xl:rounded-lg xl:border xl:border-transparent xl:px-4 xl:py-3 xl:text-[13px] xl:font-bold" : ""} ${
              isActive
                ? isRoadmapPage ? "text-[#67e875] xl:border-[#43c65b]/55 xl:bg-[#2cad4b]/20 xl:text-[#8af298]" : "text-[#50D05C]"
                : isDarkPage || isRoadmapPage
                  ? "text-white/45 hover:text-white/80"
                  : "text-black/50 hover:text-black/80"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        )
      })}
      {isRoadmapPage && <div className="relative mt-auto hidden min-h-22 overflow-hidden rounded-xl border border-[#75e8dc]/35 bg-[#041832] shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_8px_20px_rgba(0,16,36,.22)] xl:block"><p className="font-pixel relative z-10 px-4 py-5 text-[11px] font-bold uppercase leading-5 tracking-wider text-[#a0ffc5] drop-shadow-[0_1px_2px_rgba(0,20,28,.8)]">Disciplina hoje<br />constrói o seu amanhã.</p></div>}
    </nav>
  )
}
