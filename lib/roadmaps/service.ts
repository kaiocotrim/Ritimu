import { RoadmapProgressStatus, XpSource } from "@/lib/generated/prisma/enums"
import { awardXp } from "@/lib/gamification"
import { prisma } from "@/lib/prisma"
import { FULL_STACK_ROADMAP_DEFINITION, FULL_STACK_DEFINITION_VERSION, FULL_STACK_NODES, readFullStackNodeMetadata } from "@/lib/roadmaps/full-stack/definition"

export async function ensureOfficialRoadmaps() {
  const synchronized = await prisma.studyRoadmap.findUnique({
    where: { slug: FULL_STACK_ROADMAP_DEFINITION.slug },
    select: { sourceMetadata: true, modules: { select: { lessons: { select: { sourceMetadata: true } } } } },
  })
  const synchronizedMetadata = synchronized?.sourceMetadata as { definitionVersion?: number } | null
  const synchronizedKeys = new Set(synchronized?.modules.flatMap((module) => module.lessons).flatMap((lesson) => readFullStackNodeMetadata(lesson.sourceMetadata)?.nodeKey ?? []) ?? [])
  if (synchronizedMetadata?.definitionVersion === FULL_STACK_DEFINITION_VERSION && synchronizedKeys.size === FULL_STACK_NODES.length) {
    return (await prisma.studyRoadmap.findUniqueOrThrow({ where: { slug: FULL_STACK_ROADMAP_DEFINITION.slug }, select: { id: true } })).id
  }
  const roadmap = await prisma.studyRoadmap.upsert({
    where: { slug: FULL_STACK_ROADMAP_DEFINITION.slug },
    update: { title: "Full Stack Developer", description: "Um mapa completo para aprender frontend, backend e DevOps com recursos gratuitos selecionados.", category: "Desenvolvimento", estimatedHours: 120, isOfficial: true, isPublic: true, sourceMetadata: { syncingDefinitionVersion: FULL_STACK_DEFINITION_VERSION, assessmentRequired: true } },
    create: { title: "Full Stack Developer", slug: FULL_STACK_ROADMAP_DEFINITION.slug, description: "Um mapa completo para aprender frontend, backend e DevOps com recursos gratuitos selecionados.", category: "Desenvolvimento", estimatedHours: 120, isOfficial: true, isPublic: true, origin: "OFFICIAL", sourceMetadata: { syncingDefinitionVersion: FULL_STACK_DEFINITION_VERSION, assessmentRequired: true } },
    select: { id: true },
  })
  const existing = await prisma.roadmapLesson.findMany({ where: { module: { roadmapId: roadmap.id } }, select: { id: true, title: true, sourceMetadata: true } })
  const ids = new Map<string, string>()
  for (const [sectionIndex, section] of (["frontend", "backend", "devops"] as const).entries()) {
    const roadmapModule = await prisma.roadmapModule.upsert({ where: { roadmapId_order: { roadmapId: roadmap.id, order: 101 + sectionIndex } }, update: { title: section.toUpperCase(), description: `Nós oficiais de ${section}.` }, create: { roadmapId: roadmap.id, title: section.toUpperCase(), description: `Nós oficiais de ${section}.`, order: 101 + sectionIndex }, select: { id: true } })
    for (const [orderIndex, node] of FULL_STACK_NODES.filter((item) => item.section === section).entries()) {
      const found = existing.find((lesson) => readFullStackNodeMetadata(lesson.sourceMetadata)?.nodeKey === node.key)
      const data = { title: node.title, description: node.description, objective: node.kind === "TOPIC" ? `Compreender ${node.title} usando recursos externos gratuitos.` : `Concluir o ${node.title}.`, content: [], order: orderIndex + 1, type: node.kind === "CHECKPOINT" ? "CHALLENGE" as const : "STUDY" as const, estimatedMinutes: node.kind === "CHECKPOINT" ? 90 : 60, xpReward: node.kind === "CHECKPOINT" ? 50 : 25, sourceMetadata: { nodeKey: node.key, definitionVersion: FULL_STACK_DEFINITION_VERSION, nodeKind: node.kind, countsForProgress: true } }
      const current = found ? await prisma.roadmapLesson.update({ where: { id: found.id }, data, select: { id: true } }) : await prisma.roadmapLesson.create({ data: { moduleId: roadmapModule.id, ...data }, select: { id: true } })
      ids.set(node.key, current.id)
      // Preserva os registros antigos e reconcilia somente correspondências únicas e exatas.
      if (!found) {
        const matches = existing.filter((lesson) => !readFullStackNodeMetadata(lesson.sourceMetadata) && lesson.title === node.title)
        if (matches.length === 1) {
          const progress = await prisma.roadmapLessonProgress.findMany({ where: { lessonId: matches[0].id, status: "COMPLETED" }, select: { userId: true, completedAt: true } })
          for (const item of progress) await prisma.roadmapLessonProgress.upsert({ where: { userId_lessonId: { userId: item.userId, lessonId: current.id } }, update: {}, create: { userId: item.userId, lessonId: current.id, status: "COMPLETED", progress: 100, completedAt: item.completedAt } })
        }
      }
    }
  }
  await prisma.roadmapLessonDependency.deleteMany({ where: { lessonId: { in: [...ids.values()] } } })
  for (const edge of FULL_STACK_ROADMAP_DEFINITION.edges) {
    const lessonId = ids.get(edge.to), prerequisiteId = ids.get(edge.from)
    if (lessonId && prerequisiteId) await prisma.roadmapLessonDependency.create({ data: { lessonId, prerequisiteId } })
  }
  await prisma.studyRoadmap.update({ where: { id: roadmap.id }, data: { sourceMetadata: { definitionVersion: FULL_STACK_DEFINITION_VERSION, assessmentRequired: true } } })
  return roadmap.id
}

export async function completeRoadmapLesson(userId: string, roadmapId: string, lessonId: string) {
  const lesson = await prisma.roadmapLesson.findFirst({ where: { id: lessonId, module: { roadmapId } }, include: { prerequisites: { include: { prerequisite: { select: { id: true } } } }, module: { select: { roadmap: { select: { sourceMetadata: true } } } } } })
  if (!lesson) throw new Error("Etapa não encontrada.")
  const prerequisites = lesson.prerequisites.map((item) => item.prerequisite.id)
  if (prerequisites.length) {
    const done = await prisma.roadmapLessonProgress.count({ where: { userId, lessonId: { in: prerequisites }, status: RoadmapProgressStatus.COMPLETED } })
    if (done !== prerequisites.length) throw new Error("Conclua os pré-requisitos antes de avançar.")
  }
  return prisma.$transaction(async (tx) => {
    await tx.roadmapEnrollment.upsert({ where: { userId_roadmapId: { userId, roadmapId } }, update: {}, create: { userId, roadmapId } })
    const progress = await tx.roadmapLessonProgress.upsert({ where: { userId_lessonId: { userId, lessonId } }, update: { status: "COMPLETED", progress: 100, completedAt: new Date() }, create: { userId, lessonId, status: "COMPLETED", progress: 100, completedAt: new Date() } })
    await awardXp(tx, { userId, amount: lesson.xpReward, source: XpSource.ROADMAP_LESSON, referenceId: lesson.id, description: `Roadmap: ${lesson.title}` })
    const assessmentRequired = (lesson.module.roadmap.sourceMetadata as { assessmentRequired?: boolean } | null)?.assessmentRequired === true
    if (!assessmentRequired) {
      const [total, done] = await Promise.all([tx.roadmapLesson.count({ where: { module: { roadmapId } } }), tx.roadmapLessonProgress.count({ where: { userId, status: "COMPLETED", lesson: { module: { roadmapId } } } })])
      if (total > 0 && total === done) await tx.roadmapEnrollment.update({ where: { userId_roadmapId: { userId, roadmapId } }, data: { completedAt: new Date() } })
    }
    return progress
  })
}
