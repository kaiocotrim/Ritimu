import { requireX1UserId } from "@/lib/x1/auth"
import { listSubjects, x1ErrorResponse } from "@/lib/x1/service"

export async function GET() {
  if (!await requireX1UserId()) return Response.json({ error: "Não autenticado." }, { status: 401 })
  try { return Response.json({ subjects: await listSubjects() }) } catch (error) { return x1ErrorResponse(error) }
}
