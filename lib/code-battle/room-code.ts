const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function normalizeCodeBattleRoomCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "")
}

export function createCodeBattleRoomCode(random = Math.random) {
  let code = "RTM"
  for (let index = 0; index < 3; index += 1) {
    code += ALPHABET[Math.floor(random() * ALPHABET.length)]
  }
  return code
}
