import { prisma } from "@/lib/prisma"
import { getStudyPlanUserId } from "@/lib/study-plan/auth"

export async function GET() {
  const userId = await getStudyPlanUserId()
  if (!userId) return Response.json({ error: "Não autenticado" }, { status: 401 })
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const plan = await prisma.studyPlan.findUnique({ where: { userId_planDate: { userId, planDate: today } }, include: { sessions: { orderBy: { scheduledStart: "asc" } } } })
  return Response.json({ plan })
}
