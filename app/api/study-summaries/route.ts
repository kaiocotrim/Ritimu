import { createHash } from "node:crypto"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { extractMaterialContent } from "@/lib/material-content/extractor"
import type { GoogleClassroomCourseWork, GoogleClassroomCourseWorkMaterial } from "@/lib/google-classroom"
import { prisma } from "@/lib/prisma"
import { generateStudySummary, SummaryServiceError } from "@/lib/knowledge/summary-service"

type Body = { courseId?: string; sourceId?: string; sourceKind?: "coursework" | "material" }

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const courseId = new URL(request.url).searchParams.get("courseId")
  if (!courseId) return Response.json({ error: "Disciplina não informada" }, { status: 400 })
  const course = await prisma.classroomCourse.findFirst({ where: { id: courseId, userId: session.user.id }, select: { id: true } })
  if (!course) return Response.json({ error: "Disciplina não encontrada" }, { status: 404 })
  const summaries = await prisma.studySummary.findMany({ where: { userId: session.user.id, courseId }, select: { id: true, sourceId: true, title: true, sourceType: true, content: true, sourceUrl: true, updatedAt: true } })
  return Response.json({ summaries })
}

export async function POST(request: Request) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const body = await request.json().catch(() => null) as Body | null
  if (!body?.courseId || !body.sourceId || !body.sourceKind) return Response.json({ error: "Material inválido" }, { status: 400 })

  const [course, account] = await Promise.all([
    prisma.classroomCourse.findFirst({ where: { id: body.courseId, userId: session.user.id }, select: { id: true, googleCourseId: true } }),
    prisma.account.findFirst({ where: { userId: session.user.id, providerId: "google" }, select: { id: true } }),
  ])
  if (!course) return Response.json({ error: "Disciplina não encontrada" }, { status: 404 })
  if (!account) return Response.json({ error: "Google Classroom não conectado" }, { status: 400 })

  try {
    const { accessToken } = await auth.api.getAccessToken({ body: { accountId: account.id }, headers: requestHeaders })
    const endpoint = body.sourceKind === "coursework" ? "courseWork" : "courseWorkMaterials"
    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${encodeURIComponent(course.googleCourseId)}/${endpoint}/${encodeURIComponent(body.sourceId)}`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" })
    if (!response.ok) return Response.json({ error: "Não foi possível confirmar o material no Google Classroom" }, { status: response.status === 403 ? 403 : 502 })
    const item = await response.json() as GoogleClassroomCourseWork | GoogleClassroomCourseWorkMaterial
    const material = item.materials?.find((entry) => entry.link?.url || entry.driveFile?.driveFile?.alternateLink || entry.form?.formUrl || entry.gem?.url || entry.notebook?.url)
    if (!material) return Response.json({ error: "Este item não possui um arquivo Google compatível com resumo automático" }, { status: 422 })
    const sourceUrl = material.link?.url ?? material.driveFile?.driveFile?.alternateLink ?? material.form?.formUrl ?? material.gem?.url ?? material.notebook?.url
    const extracted = await extractMaterialContent({ material: { title: item.title, url: sourceUrl }, accessToken })
    const contentHash = createHash("sha256").update(extracted.text).digest("hex")
    const existing = await prisma.studySummary.findUnique({ where: { userId_courseId_sourceId: { userId: session.user.id, courseId: course.id, sourceId: body.sourceId } }, select: { id: true, contentHash: true, content: true, title: true, sourceType: true, sourceUrl: true, updatedAt: true } })
    if (existing?.contentHash === contentHash) return Response.json({ summary: existing, reused: true })
    const content = await generateStudySummary(extracted)
    const summary = await prisma.studySummary.upsert({ where: { userId_courseId_sourceId: { userId: session.user.id, courseId: course.id, sourceId: body.sourceId } }, create: { userId: session.user.id, courseId: course.id, sourceId: body.sourceId, sourceType: extracted.sourceType, sourceUrl: extracted.sourceUrl, title: extracted.title, content, contentHash }, update: { sourceType: extracted.sourceType, sourceUrl: extracted.sourceUrl, title: extracted.title, content, contentHash } })
    return Response.json({ summary, reused: false })
  } catch (error) {
    const message = error instanceof SummaryServiceError || error instanceof Error ? error.message : "Não foi possível gerar o resumo"
    return Response.json({ error: message }, { status: 422 })
  }
}