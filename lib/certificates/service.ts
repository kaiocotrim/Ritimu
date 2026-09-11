import { prisma } from "@/lib/prisma"
import { generateCertificateCode } from "./code"
import { FULL_STACK_CERTIFICATE_CORRECT, FULL_STACK_ASSESSMENT_TOTAL } from "@/lib/roadmaps/full-stack/assessment-rules"

export interface IssueCertificateInput {
  userId: string
  roadmapId: string
  studentName: string
}

export interface PublicCertificateData {
  code: string
  studentName: string
  roadmapName: string
  score: number
  totalQuestions: number
  percentage: number
  issuedAt: Date
}

/**
 * Issues a certificate idempotently.
 * Validates on the server that the user reached the 90% passing threshold.
 */
export async function issueCertificate({
  userId,
  roadmapId,
  studentName,
}: IssueCertificateInput) {
  if (!userId || typeof userId !== "string") {
    throw new Error("Usuário inválido.")
  }
  if (!roadmapId || typeof roadmapId !== "string") {
    throw new Error("Roadmap inválido.")
  }

  const cleanName = studentName?.trim()
  if (!cleanName || cleanName.length < 3 || cleanName.length > 100) {
    throw new Error("O nome no certificado deve ter entre 3 e 100 caracteres.")
  }

  // Idempotency: Return existing certificate if already issued for this user & roadmap
  const existing = await prisma.certificate.findUnique({
    where: {
      userId_roadmapId: {
        userId,
        roadmapId,
      },
    },
  })

  if (existing) {
    return {
      certificate: existing,
      newlyIssued: false,
    }
  }

  // Verify server-side that the user has a passing attempt (>= 45/50)
  const attempt = await prisma.roadmapAssessmentAttempt.findFirst({
    where: {
      userId,
      roadmapId,
      correctAnswers: { gte: FULL_STACK_CERTIFICATE_CORRECT },
      total: FULL_STACK_ASSESSMENT_TOTAL,
    },
    orderBy: [{ correctAnswers: "desc" }, { submittedAt: "desc" }],
  })

  if (!attempt) {
    throw new Error(
      `Você não possui uma avaliação com pelo menos ${FULL_STACK_CERTIFICATE_CORRECT}/${FULL_STACK_ASSESSMENT_TOTAL} acertos nesta trilha para emitir o certificado.`
    )
  }

  // Fetch roadmap title and slug
  const roadmap = await prisma.studyRoadmap.findUnique({
    where: { id: roadmapId },
    select: { id: true, title: true, slug: true },
  })

  if (!roadmap) {
    throw new Error("Roadmap não encontrado.")
  }

  // Generate unique unpredictable code
  let code = ""
  let isUnique = false
  for (let attemptCount = 0; attemptCount < 5; attemptCount++) {
    const candidate = generateCertificateCode(roadmap.slug)
    const duplicate = await prisma.certificate.findUnique({
      where: { code: candidate },
      select: { id: true },
    })
    if (!duplicate) {
      code = candidate
      isUnique = true
      break
    }
  }

  if (!isUnique || !code) {
    throw new Error("Falha ao gerar código de certificado único. Tente novamente.")
  }

  const certificate = await prisma.certificate.create({
    data: {
      code,
      userId,
      roadmapId,
      assessmentAttemptId: attempt.id,
      studentName: cleanName,
      roadmapName: roadmap.title,
      score: attempt.correctAnswers,
      totalQuestions: attempt.total,
      percentage: attempt.percentage,
    },
  })

  return {
    certificate,
    newlyIssued: true,
  }
}

/**
 * Returns all certificates belonging to a specific user.
 */
export async function getUserCertificates(userId: string) {
  return prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    include: {
      roadmap: {
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          estimatedHours: true,
        },
      },
    },
  })
}

/**
 * Returns the certificate of a user for a specific roadmap, if any.
 */
export async function getUserCertificateForRoadmap(userId: string, roadmapId: string) {
  return prisma.certificate.findUnique({
    where: {
      userId_roadmapId: {
        userId,
        roadmapId,
      },
    },
  })
}

/**
 * Returns public, sanitized certificate information by code (no private user data).
 */
export async function getCertificateByCode(code: string): Promise<PublicCertificateData | null> {
  const cert = await prisma.certificate.findUnique({
    where: { code },
    select: {
      code: true,
      studentName: true,
      roadmapName: true,
      score: true,
      totalQuestions: true,
      percentage: true,
      issuedAt: true,
    },
  })

  return cert
}
