"use client"

import Image from "next/image"
import { Check, LockKeyhole, X } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"
import { getClientStorageItem, removeClientStorageItem, setClientStorageItem } from "@/lib/client-storage"
import { characters, rarityConfig, starterCharacterIds } from "@/lib/characters"

const statLabels = [
  ["Energia", "energy"],
  ["Foco", "focus"],
  ["Criatividade", "creativity"],
  ["Velocidade", "speed"],
] as const

export function CharacterSelection() {
  const open = useSyncExternalStore((onChange) => {
    window.addEventListener("ritimu-character-change", onChange)
    return () => window.removeEventListener("ritimu-character-change", onChange)
  }, () => {
    if (getClientStorageItem("ritimu-character-modal-open") === "true") return true
    const savedId = getClientStorageItem("ritimu-character-id")
    return getClientStorageItem("ritimu-character-selected") !== "true" || !savedId || !characters.some((character) => character.id === savedId)
  }, () => false)
  const [selectedOverride, setSelectedOverride] = useState<string | null>(null)
  const [unlockedIds, setUnlockedIds] = useState<ReadonlySet<string>>(() => new Set(starterCharacterIds))
  useEffect(() => {
    fetch("/api/characters").then((response) => response.ok ? response.json() : null).then((body: { unlockedIds?: string[] } | null) => {
      if (body?.unlockedIds) setUnlockedIds(new Set(body.unlockedIds))
    })
  }, [open])
  const storedId = typeof window === "undefined" ? null : getClientStorageItem("ritimu-character-id")
  const selectedId = selectedOverride ?? (characters.some((character) => character.id === storedId && unlockedIds.has(character.id)) ? storedId : "ritimu_boy")
  const selected = characters.find((character) => character.id === selectedId) ?? characters.find((character) => character.id === "ritimu_boy")!

  function continueLater() {
    setClientStorageItem("ritimu-character-selected", "true")
    removeClientStorageItem("ritimu-character-modal-open")
    window.dispatchEvent(new Event("ritimu-character-change"))
  }

  function selectCharacter() {
    setClientStorageItem("ritimu-character-selected", "true")
    setClientStorageItem("ritimu-character-id", selected.id)
    removeClientStorageItem("ritimu-character-modal-open")
    window.dispatchEvent(new Event("ritimu-character-change"))
  }

  if (!open) return null

  return <div className="roadmaps-character-ui fixed inset-0 z-70 grid place-items-center bg-[#061b20]/70 p-3 backdrop-blur-sm sm:p-6">
    <section role="dialog" aria-modal="true" aria-labelledby="character-title" className="relative max-h-[calc(100vh-1.5rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border-2 border-[#d49a32] bg-[#062c2f] p-4 text-white shadow-[8px_8px_0_#101712] sm:p-6">
      <button type="button" onClick={continueLater} aria-label="Fechar seleção" className="absolute right-4 top-4 grid size-9 place-items-center rounded-lg border border-white/20 bg-white/5 text-white/70 transition hover:bg-white/15 hover:text-white"><X className="size-4" /></button>
      <header className="pr-12"><p className="font-pixel text-xs font-bold uppercase tracking-wider text-[#67e875]">Sua jornada começa agora</p><h2 id="character-title" className="font-pixel mt-2 text-2xl font-bold sm:text-4xl">Escolha seu personagem</h2><p className="font-pixel mt-2 text-xs text-white/60 sm:text-sm">Defina seu avatar inicial e comece sua evolução.</p></header>
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">{characters.map((character) => { const unlocked = unlockedIds.has(character.id); const rarity = rarityConfig[character.rarity]; return <button key={character.id} type="button" disabled={!unlocked} onClick={() => setSelectedOverride(character.id)} className={`relative min-h-28 rounded-lg border-2 p-1.5 text-center transition sm:min-h-32 ${selectedId === character.id ? "border-[#67e875] bg-[#0d5145] shadow-[0_0_0_2px_#2a9f57]" : unlocked ? "border-white/15 bg-[#073a3b] hover:border-white/40" : "border-white/10 bg-[#04282a] opacity-55"}`}><div className="relative mx-auto h-16 w-full sm:h-20"><Image src={character.image} alt={character.name} fill sizes="100px" className={`object-contain ${unlocked ? "" : "grayscale"}`} /></div><strong className="font-pixel block truncate text-[10px] sm:text-xs">{character.name}</strong><span className="font-pixel mt-1 block text-[7px] font-bold uppercase" style={{ color: rarity.color }}>{rarity.label}</span>{selectedId === character.id && <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-[#67e875] text-[#06352d]"><Check className="size-3" /></span>}{!unlocked && <span className="absolute inset-0 grid place-items-center bg-[#031b1d]/35"><LockKeyhole className="size-6 text-white" /></span>}</button>})}</div>
        <div className="rounded-xl border border-white/15 bg-[#073a3b] p-3 sm:p-4"><div className="flex items-center gap-3 border-b border-white/10 pb-3"><div className="relative h-20 w-24 shrink-0 sm:h-24 sm:w-28"><Image src={selected.image} alt={selected.name} fill sizes="120px" className="object-contain" /></div><div><h3 className="font-pixel text-xl font-bold sm:text-2xl">{selected.name}</h3><span className="font-pixel mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase" style={{ color: rarityConfig[selected.rarity].color, backgroundColor: `${rarityConfig[selected.rarity].color}22` }}>{rarityConfig[selected.rarity].label}</span></div></div><p className="font-pixel mt-3 text-[10px] leading-4 text-white/65">{selected.description}. Evolua passo a passo.</p><div className="mt-4 space-y-2">{statLabels.map(([label, key]) => <div key={label} className="flex items-center gap-2"><span className="font-pixel w-20 text-[9px] text-white/70">{label}</span><span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-[#67e875]" style={{ width: `${selected[key]}%` }} /></span><strong className="font-pixel w-6 text-right text-[10px]">{selected[key]}</strong></div>)}</div></div>
      </div>
      <footer className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={continueLater} className="font-pixel rounded-lg border-2 border-white/25 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white/75 transition hover:bg-white/10">Continuar depois</button><button type="button" onClick={selectCharacter} className="font-pixel rounded-lg border-2 border-[#67e875] bg-[#67e875] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#06352d] transition hover:bg-[#82f48c]">Selecionar personagem <span aria-hidden="true">→</span></button></footer>
    </section>
  </div>
}
