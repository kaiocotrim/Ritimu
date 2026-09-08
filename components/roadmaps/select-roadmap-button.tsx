"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check, LoaderCircle } from "lucide-react"

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
  return <div><button onClick={select} disabled={pending} className="font-pixel mt-6 inline-flex items-center gap-2 rounded-lg border-2 border-[#101217] bg-[#101217] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#299d37] hover:border-[#299d37] disabled:opacity-60">{pending ? <LoaderCircle className="size-4 animate-spin" /> : selected ? <Check className="size-4" /> : <ArrowRight className="size-4" />}{selected ? "Continuar" : "Escolher"}</button>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</div>
}
