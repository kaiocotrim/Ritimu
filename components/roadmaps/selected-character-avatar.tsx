"use client"

import Image from "next/image"
import { useSyncExternalStore } from "react"
import { getClientStorageItem } from "@/lib/client-storage"

const characterImages: Record<string, string> = {
  cavaleiro: "/personagens_ritimu_png/cavaleiro.png",
  mago: "/personagens_ritimu_png/mago.png",
  arqueira: "/personagens_ritimu_png/arqueira.png",
  ninja: "/personagens_ritimu_png/ninja.png",
  monge: "/personagens_ritimu_png/monge.png",
  robo: "/personagens_ritimu_png/robo.png",
  rei: "/personagens_ritimu_png/rei.png",
  viking: "/personagens_ritimu_png/viking.png",
  rogue: "/personagens_ritimu_png/rogue.png",
  zumbi: "/personagens_ritimu_png/zumbi.png",
  esqueleto: "/personagens_ritimu_png/esqueleto.png",
  ritimu_boy: "/personagens_ritimu_png/ritimu_boy.png",
  ritimu_girl: "/personagens_ritimu_png/ritimu_girl.png",
  cat_girl: "/personagens_ritimu_png/cat_girl.png",
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener("ritimu-character-change", onChange)
  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener("ritimu-character-change", onChange)
  }
}

export function SelectedCharacterAvatar({ fallbackSrc = "/personagens_ritimu_png/cavaleiro.png", alt = "Avatar do personagem", fill = false, sizes, className }: {
  fallbackSrc?: string | null
  alt?: string
  fill?: boolean
  sizes?: string
  className?: string
}) {
  const characterId = useSyncExternalStore(subscribe, () => getClientStorageItem("ritimu-character-id"), () => null)
  const src = (characterId && characterImages[characterId]) || fallbackSrc
  if (!src) return null
  return <Image src={src} alt={alt} fill={fill} width={fill ? undefined : 56} height={fill ? undefined : 56} sizes={sizes} className={className} />
}
