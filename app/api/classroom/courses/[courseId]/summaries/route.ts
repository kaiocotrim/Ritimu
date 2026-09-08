import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { isClassroomItemKey, isSummaryProviderUrl, normalizeSummaryUrl } from "@/lib/activity-summary"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ courseId: string }> }

async function getContext({ params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const { courseId } = await params
  const userId = session.user.id
  const course = await prisma.classroomCourse.findFirst({
    where: { id: courseId, userId }, select: { id: true },
  })
  if (!course) return Response.json({ error: "Disciplina não encontrada" }, { status: 404 })
  return { userId, courseId }
}

export async function GET(_request: Request, params: RouteParams) {
  try {
    const context = await getContext(params)
    if (context instanceof Response) return context
    const summaries = await prisma.activitySummary.findMany({
      where: context, select: { itemKey: true, summaryUrl: true, notebookLmUrl: true },
    })
    return Response.json({ summaries }, { headers: { "Cache-Control": "private, no-store" } })
  } catch {
    return Response.json({ error: "Não foi possível carregar os resumos." }, { status: 500 })
  }
}

async function mutate(request: Request, params: RouteParams, remove: boolean) {
  try {
    const context = await getContext(params)
    if (context instanceof Response) return context
    const body: unknown = await request.json().catch(() => null)
    if (!body || typeof body !== "object" || !("itemKey" in body) || !isClassroomItemKey(body.itemKey)) {
      return Response.json({ error: "Atividade inválida." }, { status: 400 })
    }
    const where = { ...context, itemKey: body.itemKey }
    // These records are populated by the server from the user's Google Classroom items.
    // Reuse the same membership check as the progress endpoint, without changing completion.
    const item = await prisma.classroomItemCompletion.findFirst({ where, select: { id: true } })
    if (!item) return Response.json({ error: "Atividade não encontrada." }, { status: 404 })

    if (remove) {
      await prisma.activitySummary.deleteMany({ where })
      return Response.json({ summaryUrl: null, notebookLmUrl: null })
    }
    const rawNotionUrl = "summaryUrl" in body && typeof body.summaryUrl === "string" ? body.summaryUrl.trim() : ""
    const rawNotebookLmUrl = "notebookLmUrl" in body && typeof body.notebookLmUrl === "string" ? body.notebookLmUrl.trim() : ""
    const summaryUrl = rawNotionUrl ? normalizeSummaryUrl(rawNotionUrl) : null
    const notebookLmUrl = rawNotebookLmUrl ? normalizeSummaryUrl(rawNotebookLmUrl) : null
    if (!summaryUrl && !notebookLmUrl) return Response.json({ error: "Informe ao menos um link de resumo." }, { status: 400 })
    if (rawNotionUrl && (!summaryUrl || !isSummaryProviderUrl(summaryUrl, "notion"))) return Response.json({ error: "Informe um link válido do Notion." }, { status: 400 })
    if (rawNotebookLmUrl && (!notebookLmUrl || !isSummaryProviderUrl(notebookLmUrl, "notebooklm"))) return Response.json({ error: "Informe um link válido do NotebookLM." }, { status: 400 })
    const summary = await prisma.activitySummary.upsert({
      where: { userId_courseId_itemKey: where },
      create: { ...where, summaryUrl: summaryUrl ?? "", notebookLmUrl },
      update: { summaryUrl: summaryUrl ?? "", notebookLmUrl },
      select: { itemKey: true, summaryUrl: true, notebookLmUrl: true },
    })
    return Response.json(summary)
  } catch {
    return Response.json({ error: remove ? "Não foi possível remover o resumo." : "Não foi possível salvar o resumo." }, { status: 500 })
  }
}

export async function PUT(request: Request, params: RouteParams) {
  return mutate(request, params, false)
}

export async function DELETE(request: Request, params: RouteParams) {
  return mutate(request, params, true)
}
