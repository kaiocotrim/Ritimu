"use client"

import { AlertTriangle, RotateCcw } from "lucide-react"

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-screen place-items-center bg-[#F6F5F1] p-6 text-[#111]"><section className="max-w-md rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm"><AlertTriangle className="mx-auto size-10 text-amber-500" /><h1 className="mt-4 text-2xl font-bold">Não foi possível carregar esta tela</h1><p className="mt-2 text-sm text-black/50">Tente novamente. Se o problema continuar, volte ao início e repita a ação.</p><button type="button" onClick={reset} className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-bold text-white"><RotateCcw className="size-4" />Tentar novamente</button></section></main>
}
