"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"

export function SelectRoadmapButton({ roadmapId, selected }: { roadmapId: string; selected: boolean }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  function select() {
    if (selected) return router.push(`/roadmaps/${roadmapId}`)
    startTransition(async () => {
      const response = await fetch(`/api/roadmaps/${roadmapId}/enroll`, { method: "POST" })
      if (!response.ok) { const body = await response.json().catch(() => null) as { error?: string } | null; setError(body?.error ?? "Não foi possível escolher esta trilha."); return }
      router.push(`/roadmaps/${roadmapId}`)
      router.refresh()
    })
  }
  return <div><button onClick={select} disabled={pending} className="font-pixel mt-6 inline-flex items-center gap-2 border-2 border-[#0b140d] bg-[#2f7d3c] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_0_2px_#d49a32,4px_4px_0_2px_#101712] transition hover:bg-[#45b950] hover:shadow-[0_0_0_2px_#f0b43c,2px_2px_0_2px_#101712] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-60">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <span className="pixel-control-key grid size-5 place-items-center border-2 border-[#0b140d] bg-[#78c866] text-[10px] text-[#07100a]">A</span>}{selected ? "Continuar" : "Selecionar"}</button>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</div>
}
