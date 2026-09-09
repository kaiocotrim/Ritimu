"use client"

import { BookOpen, Check, Lock, Star, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { SelectedCharacterAvatar } from "@/components/roadmaps/selected-character-avatar"

type Lesson = { id: string; title: string; description: string; xpReward: number; type: string; state: "COMPLETED" | "AVAILABLE" | "LOCKED" }

export function RoadmapFlowchart({ moduleTitle, lessons, userName, onSelect }: { moduleTitle: string; lessons: Lesson[]; userName: string; onSelect: (lesson: Lesson, moduleTitle: string) => void }) {
  const currentIndex = lessons.findIndex((lesson) => lesson.state === "AVAILABLE")

  return <div className="relative overflow-hidden border-t-2 border-black/15 bg-[#fffdf5] px-3 py-10 sm:px-8">
    <div className="relative mx-auto max-w-3xl">
      <div aria-hidden="true" className="absolute bottom-8 left-1/2 top-12 w-0.5 -translate-x-1/2 bg-[#343a3b]" />
      <div className="font-pixel relative z-10 mx-auto mb-10 w-fit border-2 border-[#191d1c] bg-[#f5c542] px-7 py-3 text-center text-sm font-bold uppercase tracking-wider text-[#171b19] shadow-[4px_4px_0_#171b19]">{moduleTitle}</div>
      {lessons.map((lesson, index) => {
        const Icon = lesson.type === "PROJECT" ? Trophy : lesson.state === "LOCKED" ? Lock : lesson.state === "COMPLETED" ? Check : index === 0 ? BookOpen : Star
        const current = index === currentIndex
        const onLeft = index % 2 === 0

        return <div key={lesson.id} className="relative grid min-h-28 grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center sm:grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)]">
          <span aria-hidden="true" className={cn("absolute top-1/2 h-0.5 w-[calc(50%-22px)] -translate-y-1/2 bg-[#343a3b] sm:w-[calc(50%-36px)]", onLeft ? "left-[22px] sm:left-[36px]" : "right-[22px] sm:right-[36px]")} />
          <span className={cn("relative z-10 col-start-2 mx-auto grid size-8 place-items-center border-2 border-[#1d2321] text-white shadow-[2px_2px_0_#1d2321]", lesson.state === "COMPLETED" ? "bg-[#35b851]" : lesson.state === "AVAILABLE" ? "bg-[#f5c542] text-black" : "bg-[#9ca3a1]")}><Icon className="size-4" /></span>
          <button type="button" onClick={() => onSelect(lesson, moduleTitle)} aria-label={`${lesson.title}. ${lesson.state === "COMPLETED" ? "Etapa concluída. Abrir para revisar" : lesson.state === "LOCKED" ? "Etapa bloqueada" : "Etapa disponível"}`} className={cn("relative row-start-1 border-2 border-[#1d2321] px-2 py-3 text-left shadow-[3px_3px_0_#1d2321] transition hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#50D05C]/35 sm:px-4", onLeft ? "col-start-1" : "col-start-3", lesson.state === "COMPLETED" && "bg-[#dff7df]", lesson.state === "AVAILABLE" && "bg-[#ffe27a]", lesson.state === "LOCKED" && "bg-[#e5e7e6] text-black/45")}>
            <strong className="font-pixel block text-[10px] font-bold leading-tight sm:text-sm">{lesson.title}</strong>
            <span className={cn("font-pixel mt-1 block text-[8px] font-bold uppercase sm:text-[9px]", lesson.state === "COMPLETED" ? "text-[#247f2d]" : lesson.state === "AVAILABLE" ? "text-[#8a6200]" : "text-black/40")}>{lesson.state === "COMPLETED" ? "Concluído · revisar" : lesson.state === "AVAILABLE" ? "Em andamento" : "Bloqueado"}</span>
          </button>
          {current && <div className={cn("absolute top-1/2 z-20 flex -translate-y-1/2 items-center gap-1", onLeft ? "left-[calc(50%+20px)] sm:left-[calc(50%+34px)]" : "right-[calc(50%+20px)] sm:right-[calc(50%+34px)]")}><div className="relative size-10"><SelectedCharacterAvatar alt="Personagem escolhido" fill sizes="40px" className="object-contain" /></div><span className="font-pixel hidden whitespace-nowrap text-[8px] font-bold uppercase text-[#247f2d] md:block">{userName.split(" ")[0]} está aqui</span></div>}
        </div>
      })}
      <div className="font-pixel relative z-10 mx-auto mt-4 w-fit border-2 border-[#191d1c] bg-[#1f2937] px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_#171b19]">Próximo módulo</div>
    </div>
  </div>
}
