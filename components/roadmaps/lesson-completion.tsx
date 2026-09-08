"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, LoaderCircle } from "lucide-react"

export function LessonCompletion({ roadmapId, lessonId, completed, locked }: { roadmapId: string; lessonId: string; completed: boolean; locked: boolean }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  function complete() { startTransition(async () => { const response = await fetch(`/api/roadmaps/${roadmapId}/lessons/${lessonId}/complete`, { method: "POST" }); const body = await response.json().catch(() => null) as { error?: string } | null; if (!response.ok) return setError(body?.error ?? "Não foi possível concluir."); router.refresh() }) }
  return <div><button onClick={complete} disabled={pending || completed || locked} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#101217] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#299d37] disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/40">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}{completed ? "Etapa concluída" : locked ? "Pré-requisito pendente" : "Concluir e ganhar XP"}</button>{error && <p className="mt-2 text-sm text-red-600">{error}</p>}</div>
}
