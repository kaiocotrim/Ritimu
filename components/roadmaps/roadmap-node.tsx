"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, LoaderCircle, Lock, Play, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

type NodeState = "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "COMPLETED"

export function RoadmapNode({ roadmapId, lesson, state, side }: {
  roadmapId: string
  lesson: { id: string; title: string; description: string; xpReward: number }
  state: NodeState
  side: "left" | "right"
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function complete() {
    setError(null)
    startTransition(async () => {
      const response = await fetch(`/api/roadmaps/${roadmapId}/lessons/${lesson.id}/complete`, { method: "POST" })
      const body = await response.json().catch(() => null) as { error?: string } | null
      if (!response.ok) return setError(body?.error ?? "Não foi possível concluir a etapa.")
      router.refresh()
    })
  }

  const Icon = state === "COMPLETED" ? Check : state === "LOCKED" ? Lock : state === "IN_PROGRESS" ? Play : Sparkles
  return (
    <article className={cn("relative flex w-[270px]", side === "right" ? "col-start-3 justify-start" : "col-start-1 justify-end")}>
      <div className={cn(
        "group relative w-[220px] rounded-lg border-2 px-3 py-2.5 text-sm shadow-[0_2px_0_rgba(0,0,0,.08)] transition duration-200",
        state === "LOCKED" && "border-black/10 bg-[#ecebea] text-black/40",
        state === "AVAILABLE" && "border-[#d8a909] bg-[#ffe66d] text-black hover:-translate-y-0.5 hover:shadow-md",
        state === "IN_PROGRESS" && "border-violet-500 bg-violet-100",
        state === "COMPLETED" && "border-[#299d37] bg-[#dff7df]",
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn("grid size-7 shrink-0 place-items-center rounded-md", state === "COMPLETED" ? "bg-[#299d37] text-white" : state === "LOCKED" ? "bg-black/5" : "bg-black/80 text-white")}>
            <Icon className="size-3.5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2"><span className="truncate font-semibold">{lesson.title}</span><span className="shrink-0 text-[10px] font-bold opacity-60">{lesson.xpReward} XP</span></div>
            {state === "AVAILABLE" && <button onClick={complete} disabled={pending} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold underline decoration-black/25 underline-offset-2 disabled:opacity-60">
              {pending ? <LoaderCircle className="size-3 animate-spin" /> : <Check className="size-3" />} Marcar concluída
            </button>}
            {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
        </div>
        <p className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-64 -translate-x-1/2 rounded-lg bg-black p-3 text-xs leading-5 text-white shadow-xl group-hover:block">{lesson.description}</p>
      </div>
    </article>
  )
}
