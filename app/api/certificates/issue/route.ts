import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { issueCertificate } from "@/lib/certificates/service"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado." }, { status: 401 })

  let body: { roadmapId?: string; studentName?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "Corpo da requisição inválido." }, { status: 400 })
  }

  const { roadmapId, studentName } = body

  if (!roadmapId || typeof roadmapId !== "string") {
    return Response.json({ error: "roadmapId é obrigatório." }, { status: 400 })
  }
  if (!studentName || typeof studentName !== "string") {
    return Response.json({ error: "studentName é obrigatório." }, { status: 400 })
  }

  try {
    const result = await issueCertificate({
      userId: session.user.id,
      roadmapId,
      studentName,
    })
    return Response.json(result, { status: result.newlyIssued ? 201 : 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao emitir certificado."
    return Response.json({ error: message }, { status: 422 })
  }
}
