import { beforeAll, describe, expect, it, vi } from "vitest"
import { getAssessmentOutcome, isAssessmentUnlocked } from "./assessment-rules"

vi.mock("server-only", () => ({}))

describe("Full Stack final assessment", () => {
  let bank: typeof import("./assessment.server").FULL_STACK_QUESTION_BANK
  let publicQuestions: ReturnType<typeof import("./assessment.server").getPublicAssessmentQuestions>

  beforeAll(async () => {
    const assessment = await import("./assessment.server")
    bank = assessment.FULL_STACK_QUESTION_BANK
    publicQuestions = assessment.getPublicAssessmentQuestions()
  })

  it("has exactly 50 valid four-option questions", () => {
    expect(bank).toHaveLength(50)
    for (const question of bank) {
      expect(question.options).toHaveLength(4)
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0)
      expect(question.correctAnswer).toBeLessThan(4)
    }
  })

  it("never exposes correctAnswer in the read payload", () => {
    expect(publicQuestions).toHaveLength(50)
    expect(publicQuestions.every((question) => !("correctAnswer" in question))).toBe(true)
  })

  it.each([[44, false, false], [45, true, true], [49, true, true], [50, true, true]])("scores %i/50 correctly", (score, passed, certificateEligible) => {
    expect(getAssessmentOutcome(score)).toMatchObject({ passed, certificateEligible })
  })

  it("only unlocks at 100% content completion", () => {
    expect(isAssessmentUnlocked(36, 37)).toBe(false)
    expect(isAssessmentUnlocked(37, 37)).toBe(true)
  })
})
