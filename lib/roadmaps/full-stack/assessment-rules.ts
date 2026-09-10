export const FULL_STACK_ASSESSMENT_TOTAL = 50
export const FULL_STACK_PASSING_CORRECT = 45
/** Minimum correct answers to be eligible for the certificate (= passing threshold) */
export const FULL_STACK_CERTIFICATE_CORRECT = FULL_STACK_PASSING_CORRECT

export type AssessmentOutcome = { correctAnswers: number; total: 50; percentage: number; passed: boolean; certificateEligible: boolean }

export function getAssessmentOutcome(correctAnswers: number): AssessmentOutcome {
  const safeCorrect = Math.max(0, Math.min(FULL_STACK_ASSESSMENT_TOTAL, Math.trunc(correctAnswers)))
  return {
    correctAnswers: safeCorrect,
    total: FULL_STACK_ASSESSMENT_TOTAL,
    percentage: safeCorrect * 2,
    passed: safeCorrect >= FULL_STACK_PASSING_CORRECT,
    certificateEligible: safeCorrect >= FULL_STACK_CERTIFICATE_CORRECT,
  }
}

export function isAssessmentUnlocked(completed: number, total: number) {
  return total > 0 && completed === total
}
