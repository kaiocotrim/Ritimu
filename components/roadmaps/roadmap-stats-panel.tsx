import Image from "next/image"
import Link from "next/link"
import { BookOpen, Map, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { SelectedCharacterAvatar } from "@/components/roadmaps/selected-character-avatar"
import { ChangeCharacterButton } from "@/components/roadmaps/change-character-button"

// Mapear roadmaps para cores pastel
function getRoadmapColor(title: string): string {
  const colors: Record<string, string> = {
    "front-end": "bg-cyan-100",
    "frontend": "bg-cyan-100",
    "back-end": "bg-green-100",
    "backend": "bg-green-100",
    "react": "bg-cyan-100",
    "node.js": "bg-green-100",
    "nodejs": "bg-green-100",
    "banco de dados": "bg-purple-100",
    "dados": "bg-purple-100",
    "sql": "bg-purple-100",
    "git": "bg-red-100",
    "github": "bg-gray-100",
    "typescript": "bg-indigo-100",
    "javascript": "bg-yellow-100",
    "html": "bg-orange-100",
    "css": "bg-blue-100",
    "full-stack": "bg-indigo-100",
  }
  
  const titleLower = title.toLowerCase()
  for (const [key, value] of Object.entries(colors)) {
    if (titleLower.includes(key)) {
      return value
    }
  }
  return "bg-blue-100"
}

// Mapear roadmaps para cores de texto
function getRoadmapTextColor(title: string): string {
  const colors: Record<string, string> = {
    "front-end": "text-cyan-700",
    "frontend": "text-cyan-700",
    "back-end": "text-green-700",
    "backend": "text-green-700",
    "react": "text-cyan-700",
    "node.js": "text-green-700",
    "nodejs": "text-green-700",
    "banco de dados": "text-purple-700",
    "dados": "text-purple-700",
    "sql": "text-purple-700",
    "git": "text-red-700",
    "github": "text-gray-700",
    "typescript": "text-indigo-700",
    "javascript": "text-amber-700",
    "html": "text-orange-700",
    "css": "text-blue-700",
    "full-stack": "text-indigo-700",
  }
  
  const titleLower = title.toLowerCase()
  for (const [key, value] of Object.entries(colors)) {
    if (titleLower.includes(key)) {
      return value
    }
  }
  return "text-blue-700"
}

export function RoadmapStatsPanel({ user, gamification, activeRoadmaps, mission, recommendations }: {
  user: { name: string; image?: string | null }
  gamification: { level: number; totalXp: number; nextLevelXp: number; progress: number; streak: number }
  activeRoadmaps: number
  mission: { current: number; target: number; progress: number }
  recommendations: { id: string; title: string; category: string; estimatedHours: number }[]
}) {
  return <aside className="hidden space-y-4 xl:block">
    <section className="relative rounded-2xl bg-[#0c282d] p-5 text-white shadow-sm"><ChangeCharacterButton /><div className="flex items-center gap-3"><div className="relative size-14 overflow-hidden rounded-xl bg-[#9be895]"><SelectedCharacterAvatar alt="Personagem escolhido" fill sizes="56px" className="object-contain" /></div><div className="min-w-0 flex-1"><h2 className="font-pixel truncate font-bold uppercase">{user.name}</h2><p className="font-pixel text-sm font-bold text-[#84e28d]">Nível {gamification.level}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#50d05c]" style={{ width: `${gamification.progress}%` }} /></div><p className="font-pixel mt-1 text-right text-xs text-white/60">{gamification.totalXp.toLocaleString("pt-BR")} / {gamification.nextLevelXp.toLocaleString("pt-BR")} XP</p></div></div>
      <div className="mt-5 grid grid-cols-2 gap-2"><Stat src="/iconesPixel/fire.png" alt="Fire" value={gamification.streak} label="dias seguidos" /><Stat src="/iconesPixel/star.png" alt="Star" value={gamification.totalXp.toLocaleString("pt-BR")} label="XP total" /><Stat Icon={Map} value={activeRoadmaps} label="roadmaps ativos" color="text-[#7ee487]" /></div><blockquote className="font-pixel relative isolate mt-4 min-h-32 overflow-hidden rounded-xl border border-white/10 p-6 text-white shadow-sm">
        <Image src="/bannerDoBau.png" alt="" fill className="z-0 object-cover object-right" />
        <div className="absolute inset-0 z-10 bg-linear-to-r from-[#0c282d]/90 via-[#0c282d]/35 to-transparent" />
        <p className="font-pixel relative z-20 max-w-[58%] text-left text-lg font-bold leading-tight tracking-wider text-white drop-shadow-[2px_2px_0_#0c282d]">&quot;Disciplina hoje<br />constrói o seu<br />amanhã.&quot;</p>
      </blockquote>
    </section>
    <section className="rounded-2xl border border-black/10 bg-white p-4"><div className="flex items-center justify-between"><h2 className="font-pixel font-bold uppercase">Missão diária</h2><Link href="/metas" className="font-pixel text-xs font-bold uppercase text-blue-600">Ver todas</Link></div><div className="mt-4 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#e4f8e6] text-[#299d37]"><Timer className="size-5" /></span><div className="min-w-0 flex-1"><p className="font-pixel text-xs font-bold uppercase">Estudar por 30 minutos</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-[#45b950]" style={{ width: `${mission.progress}%` }} /></div><p className="font-pixel mt-1 text-right text-[10px] font-bold">{mission.current} / {mission.target} min</p></div></div></section>
    {recommendations.length > 0 && <section className="rounded-2xl border border-black/10 bg-white p-4"><h2 className="font-pixel font-bold uppercase">Roadmaps recomendados</h2><div className="mt-3 space-y-2">{recommendations.map((roadmap) => <Link key={roadmap.id} href={`/roadmaps/${roadmap.id}`} className="flex items-center gap-3 rounded-xl border border-black/10 p-3 transition hover:border-[#50D05C]"><span className={cn("grid size-10 place-items-center rounded-lg", getRoadmapColor(roadmap.title), getRoadmapTextColor(roadmap.title))}><BookOpen className="size-5" /></span><span className="min-w-0 flex-1"><strong className="font-pixel block truncate text-xs font-bold uppercase">{roadmap.title}</strong><span className="font-pixel block truncate text-[10px] font-bold text-black/45">{roadmap.category} · {roadmap.estimatedHours}h</span></span><span aria-hidden="true">›</span></Link>)}</div></section>}
  </aside>
}

function Stat({ Icon, src, alt, value, label, color }: { Icon?: typeof Map; src?: string; alt?: string; value: string | number; label: string; color?: string }) {
  return <div className="rounded-xl border border-white/10 p-3"><div className="flex items-center gap-2">
    {src ? (
      <Image src={src} alt={alt || "icon"} width={20} height={20} className="size-5" />
    ) : Icon ? (
      <Icon className={`size-5 ${color}`} />
    ) : null}
    <strong className="font-pixel text-lg">{value}</strong>
  </div><p className="font-pixel mt-1 text-[10px] font-bold uppercase text-white/60">{label}</p></div>
}
