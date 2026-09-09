"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { BookOpen, Check, ChevronDown, Code2, Database, ExternalLink, Globe2, Lock, Network, Server, ShieldCheck, Star, Trophy, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { getFreeResources } from "@/lib/roadmaps/free-resources"
import { SelectedCharacterAvatar } from "@/components/roadmaps/selected-character-avatar"
import { RoadmapFlowchart as LearningPath } from "@/components/roadmaps/roadmap-flowchart"
import { KnowledgeRoadmap } from "@/components/roadmaps/knowledge-roadmap"

type Lesson = { id: string; title: string; description: string; xpReward: number; type: string; state: "COMPLETED" | "AVAILABLE" | "LOCKED" }
type Module = { id: string; order: number; title: string; description: string; lessons: Lesson[] }

const moduleIcons = [Globe2, Code2, Network, Star, Server, Database, ShieldCheck]
const positions = ["50%", "31%", "46%", "68%", "52%"]

// Mapear títulos de módulos para logos
function getModuleLogo(title: string): string | null {
  const logos: Record<string, string> = {
    "html": "/roadmaps-logos/html.png",
    "css": "/roadmaps-logos/css.svg",
    "javascript": "/roadmaps-logos/javascript.svg",
    "react": "/roadmaps-logos/react.svg",
    "node.js": "/roadmaps-logos/nodejs.svg",
    "nodejs": "/roadmaps-logos/nodejs.svg",
    "git": "/roadmaps-logos/git.png",
    "github": "/roadmaps-logos/github.png",
    "typescript": "/roadmaps-logos/typescript.svg",
    "banco de dados": "/roadmaps-logos/postgresql.png",
    "sql": "/roadmaps-logos/postgresql.png",
    "postgresql": "/roadmaps-logos/postgresql.png",
  }
  
  const titleLower = title.toLowerCase()
  for (const [key, value] of Object.entries(logos)) {
    if (titleLower.includes(key)) {
      return value
    }
  }
  return null
}

// Mapear títulos de módulos para cores pastel
function getModuleColor(title: string): string {
  const colors: Record<string, string> = {
    "html": "bg-orange-100",
    "css": "bg-blue-100",
    "javascript": "bg-yellow-100",
    "react": "bg-cyan-100",
    "node.js": "bg-green-100",
    "nodejs": "bg-green-100",
    "git": "bg-red-100",
    "github": "bg-gray-100",
    "typescript": "bg-indigo-100",
    "banco de dados": "bg-purple-100",
    "sql": "bg-purple-100",
    "postgresql": "bg-purple-100",
  }
  
  const titleLower = title.toLowerCase()
  for (const [key, value] of Object.entries(colors)) {
    if (titleLower.includes(key)) {
      return value
    }
  }
  return "bg-gray-100"
}

export function LegacyLearningPath({ moduleTitle, lessons, userName, onSelect }: { moduleTitle: string; lessons: Lesson[]; userName: string; onSelect: (lesson: Lesson, moduleTitle: string) => void }) {
  const currentIndex = lessons.findIndex((lesson) => lesson.state === "AVAILABLE")
  return <div className="relative min-h-115 overflow-hidden rounded-2xl bg-[#faf9f0] px-4 py-8 sm:px-12">
    <Image src="/BannerDiv22.png" alt="" fill sizes="(min-width:1280px) 900px,100vw" className="pointer-events-none object-cover object-center opacity-30" />
    <div className="relative z-10 mx-auto max-w-xl">
      {lessons.map((lesson, index) => {
        const Icon = lesson.type === "PROJECT" ? Trophy : lesson.state === "LOCKED" ? Lock : lesson.state === "COMPLETED" ? Check : index === 0 ? BookOpen : Star
        const current = index === currentIndex
        const left = positions[index % positions.length]
        const nextLeft = positions[(index + 1) % positions.length]
        return <div key={lesson.id} className="relative h-28">
          {index < lessons.length - 1 && <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-14 h-28 w-full overflow-visible"><line x1={left} y1="0" x2={nextLeft} y2="112" stroke={lesson.state === "COMPLETED" ? "#62c77a" : "#c8ccca"} strokeWidth="3" strokeDasharray="5 7" /></svg>}
          <div className="absolute top-0 -translate-x-1/2" style={{ left }}>
            {index === 0 && <span className="font-pixel absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md border-2 border-[#299d37] bg-white px-2 py-0.5 text-xs font-bold text-[#247f2d]">START</span>}
            <button type="button" onClick={() => onSelect(lesson, moduleTitle)} aria-label={`${lesson.title}. ${lesson.state === "COMPLETED" ? "Etapa concluída. Abrir para revisar" : lesson.state === "LOCKED" ? "Etapa bloqueada" : "Etapa disponível"}`} className={cn("group relative grid size-16 place-items-center rounded-full border-[5px] shadow-[0_5px_0_rgba(0,0,0,.16)] outline-none transition hover:-translate-y-1 focus-visible:ring-4 focus-visible:ring-blue-400", lesson.state === "COMPLETED" && "border-[#b8ebc0] bg-[#35b851] text-white", lesson.state === "AVAILABLE" && "border-[#ffe396] bg-[#f5b916] text-[#23313a] ring-4 ring-[#f5b916]/15", lesson.state === "LOCKED" && "border-[#dedfdd] bg-[#aeb3b1] text-white")}><Icon className="size-7" /><span className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-44 -translate-x-1/2 rounded-xl bg-[#10282e] p-2 text-center text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">{lesson.state === "COMPLETED" ? `Revisar ${lesson.title}` : lesson.title}</span></button>
            <div className={cn("absolute top-1/2 w-48 -translate-y-1/2", parseFloat(left) > 55 ? "right-[calc(100%+14px)] text-right" : "left-[calc(100%+14px)] text-left")}><p className="font-pixel text-[15px] font-bold leading-tight text-[#172027]">{lesson.title}</p><p className={cn("font-pixel mt-1 text-xs font-bold uppercase", lesson.state === "COMPLETED" ? "text-[#2ba447]" : lesson.state === "AVAILABLE" ? "text-[#df9f00]" : "text-black/40")}>{lesson.state === "COMPLETED" ? "Concluído · revisar" : lesson.state === "AVAILABLE" ? "Em andamento" : "Bloqueado"}</p></div>
            {current && <div className="absolute -top-12 left-1/2 flex -translate-x-1/2 flex-col items-center"><span className="font-pixel absolute bottom-full mb-1 whitespace-nowrap text-[10px] font-bold uppercase text-[#247f2d]">{userName.split(" ")[0]} está aqui</span><div className="relative size-14 drop-shadow-[0_2px_2px_rgba(0,0,0,.2)]"><SelectedCharacterAvatar alt="Personagem escolhido" fill sizes="56px" className="object-contain" /></div></div>}
          </div>
        </div>
      })}
    </div>
  </div>
}

export function RoadmapJourney({ roadmapId, modules, userName }: { roadmapId: string; modules: Module[]; userName: string }) {
  const router = useRouter()
  const currentModuleIndex = Math.max(0, modules.findIndex((module) => module.lessons.some((lesson) => lesson.state === "AVAILABLE")))
  const [openModule, setOpenModule] = useState(currentModuleIndex)
  const [selectedLesson, setSelectedLesson] = useState<(Lesson & { moduleTitle: string }) | null>(null)
  const [pending, startTransition] = useTransition()
  function completeLesson() {
    if (!selectedLesson || selectedLesson.state !== "AVAILABLE") return
    startTransition(async () => {
      const response = await fetch(`/api/roadmaps/${roadmapId}/lessons/${selectedLesson.id}/complete`, { method: "POST" })
      if (response.ok) { setSelectedLesson(null); router.refresh() }
    })
  }
  function selectLesson(lesson: Lesson, moduleTitle: string) {
    setSelectedLesson({ ...lesson, moduleTitle })
  }
  return <>
  <KnowledgeRoadmap modules={modules} onSelect={selectLesson} />
  <div className="hidden space-y-3">{modules.map((module, index) => {
    const completed = module.lessons.filter((lesson) => lesson.state === "COMPLETED").length
    const progress = module.lessons.length ? Math.round(completed / module.lessons.length * 100) : 0
    const Icon = moduleIcons[(module.order - 1) % moduleIcons.length]
    const logo = getModuleLogo(module.title)
    const moduleColor = getModuleColor(module.title)
    const open = index === openModule
    return <section key={module.id} className={cn("overflow-hidden rounded-2xl border bg-[#faf9f0] transition", open ? "border-[#8ddd98] shadow-sm" : "border-black/10")}>
      <button onClick={() => setOpenModule(open ? -1 : index)} aria-expanded={open} className="flex w-full items-center gap-4 p-4 text-left outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[#50D05C]/30 sm:px-5">
        <span className={cn("relative grid size-14 shrink-0 place-items-center rounded-xl overflow-hidden", logo ? moduleColor : (open ? "bg-[#a9efa9] text-[#174d25]" : "bg-black/5 text-black/55"))}>
          {logo ? (
            <Image src={logo} alt={module.title} width={40} height={40} className="object-contain" />
          ) : (
            <Icon className={cn("size-7", open ? "text-[#174d25]" : "text-black/55")} />
          )}
        </span><span className="min-w-0 flex-1"><span className="font-pixel text-xs font-bold uppercase tracking-wider text-black/40">Módulo {String(module.order).padStart(2, "0")}</span><strong className="font-pixel block truncate text-xl leading-tight">{module.title}</strong><span className="font-pixel block truncate text-xs text-black/50">{module.description}</span></span><span className="hidden w-28 sm:block"><strong className="font-pixel block text-right text-base">{completed} / {module.lessons.length}</strong><span className="mt-2 block h-2 overflow-hidden rounded-full bg-black/10"><span className="block h-full rounded-full bg-[#45b950]" style={{ width: `${progress}%` }} /></span></span><ChevronDown className={cn("size-5 transition", open && "rotate-180")} />
      </button>{open && <LearningPath moduleTitle={module.title} lessons={module.lessons} userName={userName} onSelect={selectLesson} />}
    </section>
  })}</div>
  {selectedLesson && <>
    <button type="button" aria-label="Fechar conteúdo" onClick={() => setSelectedLesson(null)} className="fixed inset-0 z-40 bg-[#071d23]/35" />
    <aside aria-label={`Conteúdo: ${selectedLesson.title}`} className="fixed inset-y-0 right-0 z-50 w-[min(100vw,380px)] overflow-y-auto border-l border-black/10 bg-white p-6 text-[#111820] shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><span className="font-pixel text-[10px] font-bold uppercase tracking-wider text-[#299d37]">Conteúdo da etapa</span><h2 className="font-pixel mt-2 text-2xl font-bold leading-tight">{selectedLesson.title}</h2></div><button type="button" onClick={() => setSelectedLesson(null)} aria-label="Fechar conteúdo" className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-black/10 hover:bg-black/5"><X className="size-4" /></button></div>
      <div className="mt-6 rounded-xl bg-[#effbef] p-4"><p className="font-pixel text-xs font-bold uppercase text-[#247f2d]">{selectedLesson.state === "COMPLETED" ? "Etapa concluída" : selectedLesson.state === "LOCKED" ? "Etapa bloqueada" : "Próxima etapa"}</p><p className="font-pixel mt-2 text-sm leading-6 text-black/65">{selectedLesson.description || `Aprenda os fundamentos de ${selectedLesson.title} e avance na sua jornada.`}</p></div>
      <div className="mt-5 flex items-center justify-between border-b border-black/10 pb-5 text-sm"><span className="font-pixel font-bold text-black/50">Recompensa</span><strong className="font-pixel text-amber-600">+{selectedLesson.xpReward} XP</strong></div>
      <section className="mt-6"><h3 className="font-pixel text-sm font-bold uppercase tracking-wider">Estude este conteúdo</h3><p className="font-pixel mt-1 text-xs leading-5 text-black/45">Materiais gratuitos para continuar aprendendo.</p><div className="mt-3 space-y-2">{[...getFreeResources(selectedLesson.moduleTitle, selectedLesson.title), { title: `Vídeos sobre ${selectedLesson.title}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${selectedLesson.moduleTitle} ${selectedLesson.title} tutorial`)}`, provider: "YouTube", kind: "Curso" as const }].map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer" className="group flex items-center justify-between gap-3 rounded-lg border border-black/10 p-3 transition hover:border-[#50D05C] hover:bg-[#f7fff7]"><span className="min-w-0"><span className="font-pixel block text-[10px] font-bold uppercase text-[#299d37]">{resource.provider} · {resource.kind}</span><strong className="font-pixel mt-1 block truncate text-xs">{resource.title}</strong></span><ExternalLink className="size-4 shrink-0 text-black/35 group-hover:text-[#299d37]" /></a>)}</div></section>
      {selectedLesson.state === "AVAILABLE" && <button type="button" onClick={completeLesson} disabled={pending} className="font-pixel mt-6 w-full rounded-lg border-2 border-[#247f2d] bg-[#35b851] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[0_3px_0_#176523] transition hover:-translate-y-0.5 disabled:opacity-60">{pending ? "Salvando..." : "Marcar como concluída"}</button>}
      {selectedLesson.state === "LOCKED" && <p className="font-pixel mt-6 text-center text-xs font-bold uppercase leading-5 text-black/45">Conclua as etapas anteriores para desbloquear este conteúdo.</p>}
    </aside>
  </>}
  </>
}
