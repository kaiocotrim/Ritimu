import { RoadmapProgressStatus, XpSource } from "@/lib/generated/prisma/enums"
import { awardXp } from "@/lib/gamification"
import { prisma } from "@/lib/prisma"
import { FULL_STACK_ROADMAP } from "@/lib/roadmaps/official-full-stack"
import { OFFICIAL_ROADMAP_CATALOG } from "@/lib/roadmaps/official-catalog"

async function ensureCatalogRoadmaps() {
  for (const catalogRoadmap of OFFICIAL_ROADMAP_CATALOG) {
    const existing = await prisma.studyRoadmap.findUnique({ where: { slug: catalogRoadmap.slug }, select: { id: true } })
    if (existing) continue
    let previousLessonId: string | null = null
    const roadmap = await prisma.studyRoadmap.create({ data: { title: catalogRoadmap.title, slug: catalogRoadmap.slug, description: catalogRoadmap.description, category: catalogRoadmap.category, estimatedHours: catalogRoadmap.estimatedHours, isOfficial: true, isPublic: true, origin: "OFFICIAL" }, select: { id: true } })
    for (const [moduleIndex, moduleData] of catalogRoadmap.modules.entries()) {
      const roadmapModule = await prisma.roadmapModule.create({ data: { roadmapId: roadmap.id, title: moduleData.title, description: moduleData.description, order: moduleIndex + 1 }, select: { id: true } })
      for (const [lessonIndex, lessonData] of moduleData.lessons.entries()) {
        const current = await prisma.roadmapLesson.create({ data: { moduleId: roadmapModule.id, title: lessonData.title, description: lessonData.description, objective: `Compreender ${lessonData.title.toLocaleLowerCase("pt-BR")} e aplicar o conceito.`, content: [lessonData.description, "Registre os conceitos essenciais.", "Pratique antes de avançar."], order: lessonIndex + 1, type: lessonData.type ?? "STUDY", estimatedMinutes: lessonData.minutes ?? 30, xpReward: lessonData.xp ?? 25 }, select: { id: true } })
        if (previousLessonId) await prisma.roadmapLessonDependency.create({ data: { lessonId: current.id, prerequisiteId: previousLessonId } })
        previousLessonId = current.id
      }
    }
  }
}

export async function ensureOfficialRoadmaps() {
  const existing = await prisma.studyRoadmap.findUnique({
    where: { slug: FULL_STACK_ROADMAP.slug },
    select: { id: true, _count: { select: { modules: true } } },
  })
  if (existing?._count.modules === FULL_STACK_ROADMAP.modules.length) {
    await ensureCatalogRoadmaps()
    return existing.id
  }

  const roadmap = await prisma.studyRoadmap.upsert({
    where: { slug: FULL_STACK_ROADMAP.slug },
    update: {
      title: FULL_STACK_ROADMAP.title,
      description: FULL_STACK_ROADMAP.description,
      category: FULL_STACK_ROADMAP.category,
      estimatedHours: FULL_STACK_ROADMAP.estimatedHours,
      isOfficial: true,
      isPublic: true,
    },
    create: {
      title: FULL_STACK_ROADMAP.title,
      slug: FULL_STACK_ROADMAP.slug,
      description: FULL_STACK_ROADMAP.description,
      category: FULL_STACK_ROADMAP.category,
      estimatedHours: FULL_STACK_ROADMAP.estimatedHours,
      isOfficial: true,
      isPublic: true,
      origin: "OFFICIAL",
    },
    select: { id: true },
  })

  let previousLessonId: string | null = null
  for (const [moduleIndex, moduleData] of FULL_STACK_ROADMAP.modules.entries()) {
    const roadmapModule = await prisma.roadmapModule.upsert({
      where: { roadmapId_order: { roadmapId: roadmap.id, order: moduleIndex + 1 } },
      update: { title: moduleData.title, description: moduleData.description },
      create: { roadmapId: roadmap.id, title: moduleData.title, description: moduleData.description, order: moduleIndex + 1 },
      select: { id: true },
    })
    for (const [lessonIndex, lessonData] of moduleData.lessons.entries()) {
      const current = await prisma.roadmapLesson.upsert({
        where: { moduleId_order: { moduleId: roadmapModule.id, order: lessonIndex + 1 } },
        update: { title: lessonData.title, description: lessonData.description },
        create: {
          moduleId: roadmapModule.id,
          title: lessonData.title,
          description: lessonData.description,
          objective: `Compreender ${lessonData.title.toLocaleLowerCase("pt-BR")} e aplicar o conceito em um exemplo próprio.`,
          content: [lessonData.description, "Anote os conceitos principais.", "Crie um pequeno exemplo antes de avançar."],
          order: lessonIndex + 1,
          type: lessonData.type ?? "STUDY",
          estimatedMinutes: lessonData.minutes ?? 30,
          xpReward: lessonData.xp ?? 25,
        },
        select: { id: true },
      })
      if (previousLessonId) {
        await prisma.roadmapLessonDependency.upsert({
          where: { lessonId_prerequisiteId: { lessonId: current.id, prerequisiteId: previousLessonId } },
          update: {},
          create: { lessonId: current.id, prerequisiteId: previousLessonId },
        })
      }
      previousLessonId = current.id
    }
  }
  await ensureCatalogRoadmaps()
  return roadmap.id
}

export async function completeRoadmapLesson(userId: string, roadmapId: string, lessonId: string) {
  const lesson = await prisma.roadmapLesson.findFirst({
    where: { id: lessonId, module: { roadmapId } },
    include: { prerequisites: { include: { prerequisite: { select: { id: true } } } } },
  })
  if (!lesson) throw new Error("Etapa não encontrada.")

  const prerequisiteIds = lesson.prerequisites.map((item) => item.prerequisite.id)
  if (prerequisiteIds.length) {
    const completed = await prisma.roadmapLessonProgress.count({
      where: { userId, lessonId: { in: prerequisiteIds }, status: RoadmapProgressStatus.COMPLETED },
    })
    if (completed !== prerequisiteIds.length) throw new Error("Conclua os pré-requisitos antes de avançar.")
  }

  return prisma.$transaction(async (tx) => {
    await tx.roadmapEnrollment.upsert({
      where: { userId_roadmapId: { userId, roadmapId } }, update: {}, create: { userId, roadmapId },
    })
    const progress = await tx.roadmapLessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { status: "COMPLETED", progress: 100, completedAt: new Date() },
      create: { userId, lessonId, status: "COMPLETED", progress: 100, completedAt: new Date() },
    })
    await awardXp(tx, { userId, amount: lesson.xpReward, source: XpSource.ROADMAP_LESSON, referenceId: lesson.id, description: `Roadmap: ${lesson.title}` })
    const [total, done] = await Promise.all([
      tx.roadmapLesson.count({ where: { module: { roadmapId } } }),
      tx.roadmapLessonProgress.count({ where: { userId, status: "COMPLETED", lesson: { module: { roadmapId } } } }),
    ])
    if (total > 0 && total === done) {
      await tx.roadmapEnrollment.update({ where: { userId_roadmapId: { userId, roadmapId } }, data: { completedAt: new Date() } })
    }
    return progress
  })
}
