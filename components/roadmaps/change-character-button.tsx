"use client"

import { SelectedCharacterAvatar } from "@/components/roadmaps/selected-character-avatar"
import { setClientStorageItem } from "@/lib/client-storage"

export function ChangeCharacterButton() {
  function openCharacterSelection() {
    setClientStorageItem("ritimu-character-modal-open", "true")
    window.dispatchEvent(new Event("ritimu-character-change"))
  }

  return <button type="button" aria-label="Trocar personagem" title="Trocar personagem" onClick={openCharacterSelection} className="absolute left-5 top-5 z-10 size-14 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#67e875]"><SelectedCharacterAvatar alt="Personagem escolhido" fill sizes="56px" className="object-contain" /></button>
}
