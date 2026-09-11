export type CharacterRarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY"

export const rarityConfig = {
  COMMON: { label: "Comum", weight: 55, color: "#94a3b8" },
  RARE: { label: "Raro", weight: 27, color: "#38bdf8" },
  EPIC: { label: "Épico", weight: 13, color: "#c084fc" },
  LEGENDARY: { label: "Lendário", weight: 5, color: "#fbbf24" },
} as const

export const characters = [
  { id: "cavaleiro", name: "Cavaleiro", rarity: "COMMON", description: "Disciplina em todas as batalhas", image: "/personagens_ritimu_png/cavaleiro.png", energy: 80, focus: 70, creativity: 50, speed: 60 },
  { id: "mago", name: "Mago", rarity: "EPIC", description: "Conhecimento sem limites", image: "/personagens_ritimu_png/mago.png", energy: 60, focus: 80, creativity: 90, speed: 45 },
  { id: "arqueira", name: "Arqueira", rarity: "RARE", description: "Foco nos seus objetivos", image: "/personagens_ritimu_png/arqueira.png", energy: 70, focus: 90, creativity: 60, speed: 80 },
  { id: "ninja", name: "Ninja", rarity: "EPIC", description: "Agilidade nos estudos", image: "/personagens_ritimu_png/ninja.png", energy: 75, focus: 85, creativity: 55, speed: 95 },
  { id: "monge", name: "Curandeiro", rarity: "RARE", description: "Equilíbrio para ir mais longe", image: "/personagens_ritimu_png/monge.png", energy: 85, focus: 80, creativity: 70, speed: 50 },
  { id: "robo", name: "Robô Estudante", rarity: "RARE", description: "Tecnologia a seu favor", image: "/personagens_ritimu_png/robo.png", energy: 90, focus: 75, creativity: 85, speed: 65 },
  { id: "rei", name: "Rei", rarity: "LEGENDARY", description: "Liderança para grandes conquistas", image: "/personagens_ritimu_png/rei.png", energy: 85, focus: 80, creativity: 65, speed: 55 },
  { id: "viking", name: "Viking", rarity: "RARE", description: "Força para superar desafios", image: "/personagens_ritimu_png/viking.png", energy: 95, focus: 65, creativity: 45, speed: 70 },
  { id: "rogue", name: "Rogue", rarity: "EPIC", description: "Estratégia em cada movimento", image: "/personagens_ritimu_png/rogue.png", energy: 65, focus: 85, creativity: 75, speed: 90 },
  { id: "zumbi", name: "Zumbi", rarity: "COMMON", description: "Persistência até o fim", image: "/personagens_ritimu_png/zumbi.png", energy: 90, focus: 60, creativity: 55, speed: 40 },
  { id: "esqueleto", name: "Esqueleto", rarity: "COMMON", description: "Determinação que não desaparece", image: "/personagens_ritimu_png/esqueleto.png", energy: 70, focus: 75, creativity: 60, speed: 65 },
  { id: "ritimu_boy", name: "Ritimu Boy", rarity: "COMMON", starter: true, description: "Curiosidade para aprender sempre", image: "/personagens_ritimu_png/ritimu_boy.png", energy: 75, focus: 75, creativity: 80, speed: 70 },
  { id: "ritimu_girl", name: "Ritimu Girl", rarity: "COMMON", starter: true, description: "Confiança para evoluir todos os dias", image: "/personagens_ritimu_png/ritimu_girl.png", energy: 80, focus: 85, creativity: 80, speed: 75 },
  { id: "cat_girl", name: "Cat Girl", rarity: "EPIC", description: "Leveza e foco na jornada", image: "/personagens_ritimu_png/cat_girl.png", energy: 70, focus: 90, creativity: 85, speed: 85 },
] as const satisfies readonly { id: string; name: string; rarity: CharacterRarity; starter?: boolean; description: string; image: string; energy: number; focus: number; creativity: number; speed: number }[]

export const starterCharacterIds = characters.filter((character) => "starter" in character && character.starter).map((character) => character.id)
