"use client"

import { Check, Lock, Star } from "lucide-react"
import { cn } from "@/lib/utils"

type Lesson = { id: string; title: string; description: string; xpReward: number; type: string; state: "COMPLETED" | "AVAILABLE" | "LOCKED" }
type Module = { id: string; order: number; title: string; description: string; lessons: Lesson[] }

export function KnowledgeRoadmap({ modules, onSelect }: { modules: Module[]; onSelect: (lesson: Lesson, moduleTitle: string) => void }) {
  return <section className="relative overflow-hidden border-2 border-[#1f2523] bg-[#f7f8fa] px-4 py-8 shadow-[5px_5px_0_#1f2523] sm:px-8">
    <div className="font-pixel mb-12 flex flex-wrap gap-4 border-2 border-[#1f2523] bg-white p-4 text-[10px] font-bold uppercase">
      <span className="flex items-center gap-2"><i className="size-3 bg-[#7c4dff]" /> Recomendado</span>
      <span className="flex items-center gap-2"><i className="size-3 bg-[#4f7f32]" /> Concluído</span>
      <span className="flex items-center gap-2"><i className="size-3 bg-[#9ca3a1]" /> Bloqueado</span>
    </div>

    <div className="relative mx-auto max-w-4xl">
      <div aria-hidden="true" className="absolute bottom-8 left-1/2 top-0 hidden w-0.5 -translate-x-1/2 bg-[#2878ff] md:block" />
      {modules.map((module, moduleIndex) => {
        const branchLeft = moduleIndex % 2 === 1
        const completed = module.lessons.filter((lesson) => lesson.state === "COMPLETED").length

        return <div key={module.id} className="relative mb-14 grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_190px_minmax(0,1fr)] md:gap-10">
          <div className={cn("relative space-y-2 md:row-start-1", branchLeft ? "md:col-start-1" : "md:col-start-3")}>
            <div aria-hidden="true" className={cn("absolute top-1/2 hidden w-10 -translate-y-1/2 border-t-2 border-dotted border-[#2878ff] md:block", branchLeft ? "-right-10" : "-left-10")} />
            {module.lessons.map((lesson) => {
              const StatusIcon = lesson.state === "COMPLETED" ? Check : lesson.state === "LOCKED" ? Lock : Star
              return <button key={lesson.id} type="button" onClick={() => onSelect(lesson, module.title)} className={cn("font-pixel relative flex w-full items-center justify-between gap-3 border-2 border-[#1f2523] px-3 py-2 text-left text-[10px] font-bold shadow-[2px_2px_0_#1f2523] transition hover:-translate-y-0.5 hover:bg-[#fff2b8]", lesson.state === "COMPLETED" ? "bg-[#dff7df]" : lesson.state === "AVAILABLE" ? "bg-[#ffe7a3]" : "bg-[#eceeed] text-black/45")}>
                <span>{lesson.title}</span>
                <span className={cn("grid size-4 shrink-0 place-items-center text-white", lesson.state === "COMPLETED" ? "bg-[#4f7f32]" : lesson.state === "AVAILABLE" ? "bg-[#7c4dff]" : "bg-[#9ca3a1]")}><StatusIcon className="size-2.5" /></span>
              </button>
            })}
          </div>

          <button type="button" onClick={() => module.lessons[0] && onSelect(module.lessons.find((lesson) => lesson.state === "AVAILABLE") ?? module.lessons[0], module.title)} className="font-pixel relative z-10 row-start-1 border-2 border-[#111] bg-[#f4f700] px-4 py-3 text-center text-xs font-bold shadow-[3px_3px_0_#111] transition hover:bg-[#ffff4d] md:col-start-2">
            <span className="block">{module.title}</span>
            <span className="mt-1 block text-[8px] text-black/55">{completed}/{module.lessons.length} conhecimentos</span>
          </button>
        </div>
      })}
      <div className="font-pixel relative z-10 mx-auto w-fit border-2 border-[#111] bg-[#f4f700] px-6 py-3 text-xs font-bold shadow-[3px_3px_0_#111]">Objetivo alcançado</div>
    </div>
  </section>
}
