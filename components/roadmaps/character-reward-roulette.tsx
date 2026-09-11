"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Gift, LoaderCircle } from "lucide-react"
import { characters, rarityConfig } from "@/lib/characters"

type Character = (typeof characters)[number]

export function CharacterRewardRoulette({ roadmapId }: { roadmapId: string }) {
  const [eligible, setEligible] = useState(false)
  const [reward, setReward] = useState<Character | null>(null)
  const [rolling, setRolling] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/roadmaps/${roadmapId}/character-reward`).then((response) => response.ok ? response.json() : null).then((body: { eligible?: boolean; character?: Character | null } | null) => {
      if (!body) return
      setEligible(Boolean(body.eligible))
      if (body.character) { setReward(body.character); setRevealed(true) }
    })
  }, [roadmapId])

  async function spin() {
    setRolling(true); setError(null); setRevealed(false)
    const response = await fetch(`/api/roadmaps/${roadmapId}/character-reward`, { method: "POST" })
    const body = await response.json() as { character?: Character; error?: string }
    if (!response.ok || !body.character) { setRolling(false); return setError(body.error ?? "Não foi possível girar a roleta.") }
    setReward(body.character)
    window.setTimeout(() => { setRolling(false); setRevealed(true); window.dispatchEvent(new Event("ritimu-character-unlocked")) }, 3600)
  }

  if (!eligible) return null
  const strip = reward ? [...characters.slice(0, 8), ...characters.slice(3, 11), reward] : []
  return <section className="mt-5 border-2 border-[#d49a32] bg-[#062c2f] p-4 text-white shadow-[4px_4px_0_#101712]">
    <div className="flex items-center gap-3"><Gift className="size-6 text-amber-300" /><div><h3 className="font-pixel text-sm font-bold">Recompensa do roadmap</h3><p className="mt-1 text-xs text-white/60">Personagens melhores são mais difíceis de conseguir.</p></div></div>
    {rolling && <div className="relative mt-4 overflow-hidden border-2 border-white/20 bg-[#031b1d] py-3"><span className="absolute left-1/2 top-0 z-10 h-full w-0.5 bg-amber-300" /><div className="character-roulette-track flex w-max gap-2">{strip.map((character, index) => <div key={`${character.id}-${index}`} className="w-24 shrink-0 border border-white/15 bg-[#073a3b] p-2 text-center"><div className="relative mx-auto size-14"><Image src={character.image} alt="" fill sizes="56px" className="object-contain" /></div><span className="font-pixel block truncate text-[8px]">{character.name}</span></div>)}</div></div>}
    {revealed && reward && <div className="mt-4 flex items-center gap-4 border p-3" style={{ borderColor: rarityConfig[reward.rarity].color }}><div className="relative size-20 shrink-0"><Image src={reward.image} alt={reward.name} fill sizes="80px" className="object-contain" /></div><div><p className="font-pixel text-[9px] font-bold uppercase" style={{ color: rarityConfig[reward.rarity].color }}>{rarityConfig[reward.rarity].label}</p><p className="font-pixel mt-1 text-lg font-bold">{reward.name}</p><p className="mt-1 text-xs text-white/60">Personagem desbloqueado permanentemente!</p></div></div>}
    {!reward && !rolling && <button type="button" onClick={spin} className="font-pixel mt-4 flex w-full items-center justify-center gap-2 border-2 border-amber-300 bg-amber-300 px-5 py-3 text-xs font-bold uppercase text-[#142015] shadow-[3px_3px_0_#101712] hover:bg-amber-200"><Gift className="size-4" /> Girar roleta</button>}
    {rolling && <p className="font-pixel mt-3 flex items-center justify-center gap-2 text-[9px] uppercase text-amber-200"><LoaderCircle className="size-3 animate-spin" /> Sorteando personagem...</p>}
    {error && <p role="alert" className="mt-3 text-xs text-red-300">{error}</p>}
  </section>
}
