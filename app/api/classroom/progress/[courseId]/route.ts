import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { awardXp, XP_REWARDS, XpSource } from "@/lib/gamification"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ courseId: string }> }
type ProgressBody = { itemKey?: unknown; completed?: unknown }

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return Response.json({ error: "Não autenticado" }, { status: 401 })

  const { courseId } = await params
  const body = (await request.json().catch(() => null)) as ProgressBody | null
  const validItemKey = typeof body?.itemKey === "string" && /^(coursework|material):[^:]+$/.test(body.itemKey)
  if (!validItemKey || typeof body?.completed !== "boolean") {
    return Response.json({ error: "Dados inválidos" }, { status: 400 })
  }

  const course = await prisma.classroomCourse.findFirst({
    where: { id: courseId, userId: session.user.id },
    select: { id: true, totalItems: true },
  })
  if (!course) return Response.json({ error: "Disciplina não encontrada" }, { status: 404 })

  const completion = await prisma.classroomItemCompletion.findFirst({
    where: { userId: session.user.id, courseId: course.id, itemKey: body.itemKey as string },
    select: { id: true },
  })
  if (!completion) return Response.json({ error: "Item não encontrado" }, { status: 404 })

  await prisma.$transaction(async (tx) => {
    await tx.classroomItemCompletion.update({
      where: { id: completion.id },
      data: { completed: body.completed as boolean },
    })
    if (body.completed) {
      await awardXp(tx, {
        userId: session.user.id,
        amount: XP_REWARDS.classroomItem,
        source: XpSource.CLASSROOM_ITEM,
        referenceId: completion.id,
        description: "Atividade do Classroom concluída",
      })
    }
  })

  const completedItems = await prisma.classroomItemCompletion.count({
    where: { userId: session.user.id, courseId: course.id, completed: true },
  })

  return Response.json({
    completed: body.completed,
    courseCompleted: course.totalItems > 0 && completedItems === course.totalItems,
  })
}
