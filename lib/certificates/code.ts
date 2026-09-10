import crypto from "crypto"

const SAFE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ"

const ROADMAP_CODE_PREFIXES: Record<string, string> = {
  "full-stack-developer": "FS",
  default: "TR",
}

/**
 * Generates a unique, unpredictable certificate verification code.
 * Format: RIT-{ROADMAP}-{RANDOM_6}
 * Example: RIT-FS-7YK92P
 */
export function generateCertificateCode(roadmapSlug?: string): string {
  const prefix = roadmapSlug ? (ROADMAP_CODE_PREFIXES[roadmapSlug] ?? "FS") : "FS"
  const bytes = crypto.randomBytes(6)
  let randomPart = ""

  for (let i = 0; i < 6; i++) {
    randomPart += SAFE_ALPHABET[bytes[i] % SAFE_ALPHABET.length]
  }

  return `RIT-${prefix}-${randomPart}`
}

/**
 * Validates the syntax of a certificate code.
 */
export function isValidCertificateCode(code: string): boolean {
  if (typeof code !== "string") return false
  const regex = /^RIT-[A-Z0-9]{2}-[2-9A-HJ-NP-Z]{6}$/
  return regex.test(code)
}
