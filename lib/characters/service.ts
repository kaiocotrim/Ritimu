import "server-only"
import { randomInt } from "node:crypto"
import { prisma } from "@/lib/prisma"
import { characters, rarityConfig, starterCharacterIds } from "@/lib/characters"

export async function getUnlockedCharacterIds(userId: string) {
  const unlocked = await prisma.userCharacter.findMany({ where: { userId }, select: { characterId: true } })
  return [...new Set([...starterCharacterIds, ...unlocked.map((item) => item.characterId)])]
}

function drawCharacter(excludedIds: ReadonlySet<string>) {
  const candidates = characters.filter((character) => !("starter" in character && character.starter) && !excludedIds.has(character.id))
  if (!candidates.length) return null
  const rarityCounts = new Map(candidates.map((character) => [character.rarity, candidates.filter((item) => item.rarity === character.rarity).length]))
  const entries = candidates.map((character) => ({ character, weight: rarityConfig[character.rarity].weight / (rarityCounts.get(character.rarity) ?? 1) }))
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = randomInt(1_000_000) / 1_000_000 * total
  for (const entry of entries) {
    roll -= entry.weight
    if (roll <= 0) return entry.character
  }
  return entries.at(-1)!.character
}

export async function claimRoadmapCharacterReward(userId: string, roadmapId: string) {
  const existing = await prisma.roadmapCharacterReward.findUnique({ where: { userId_roadmapId: { userId, roadmapId } } })
  if (existing) return { character: characters.find((item) => item.id === existing.characterId) ?? null, newlyClaimed: false }

  const enrollment = await prisma.roadmapEnrollment.findUnique({ where: { userId_roadmapId: { userId, roadmapId } }, select: { completedAt: true } })
  if (!enrollment?.completedAt) throw new Error("Conclua o roadmap antes de girar a roleta.")

  const unlockedIds = new Set(await getUnlockedCharacterIds(userId))
  const character = drawCharacter(unlockedIds)
  if (!character) throw new Error("Você já desbloqueou todos os personagens.")

  await prisma.$transaction([
    prisma.userCharacter.create({ data: { userId, characterId: character.id, sourceRoadmapId: roadmapId } }),
    prisma.roadmapCharacterReward.create({ data: { userId, roadmapId, characterId: character.id } }),
  ])
  return { character, newlyClaimed: true }
}
