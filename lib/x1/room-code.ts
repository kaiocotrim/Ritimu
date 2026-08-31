const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function createRoomCode(random = Math.random) {
  return Array.from({ length: 6 }, () => alphabet[Math.floor(random() * alphabet.length)]).join("")
}

export function normalizeRoomCode(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6)
}
