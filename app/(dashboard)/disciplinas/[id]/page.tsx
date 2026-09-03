import { ArrowLeft, BookOpen, ExternalLink, FileText } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { CompletionCheckbox } from "@/components/classroom/completion-checkbox"
import { ManualCourseWorkspace } from "@/components/classroom/manual-course-workspace"
import { auth } from "@/lib/auth"
import {
  getAssignmentUrl,
  getCourseWorkMaterialUrl,
} from "@/lib/google-classroom-assignment"
import type {
  GoogleClassroomCourseWork,
  GoogleClassroomCourseWorkMaterial,
  GoogleClassroomCourseWorkMaterialsResponse,
  GoogleClassroomCourseWorkResponse,
  GoogleClassroomTopic,
  GoogleClassroomTopicsResponse,
} from "@/lib/google-classroom"
import { prisma } from "@/lib/prisma"

type GoogleErrorResponse = {
  error?: { message?: string }
}

async function fetchAllClassroomItems<T>(
  endpoint: string,
  accessToken: string,
  key: "topic" | "courseWork" | "courseWorkMaterial"
) {
  const items: T[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(endpoint)
    url.searchParams.set("pageSize", "100")
    if (pageToken) url.searchParams.set("pageToken", pageToken)

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    })
    const data = (await response.json().catch(() => null)) as
      | (GoogleClassroomTopicsResponse &
          GoogleClassroomCourseWorkResponse &
          GoogleClassroomCourseWorkMaterialsResponse &
          GoogleErrorResponse)
      | null

    if (!response.ok) {
      throw new Error(
        data?.error?.message ?? "Falha ao consultar o Google Classroom"
      )
    }

    const pageItems =
      key === "topic"
        ? data?.topic
        : key === "courseWork"
          ? data?.courseWork
          : data?.courseWorkMaterial
    items.push(...((pageItems ?? []) as T[]))
    pageToken = data?.nextPageToken
  } while (pageToken)

  return items
}

export default async function DisciplinaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    redirect("/login")
  }

  const course = await prisma.classroomCourse.findFirst({
    where: { id, userId: session.user.id },
  })

  if (!course) {
    notFound()
  }

  const isManualCourse = course.courseState === "MANUAL"
  const manualContents = isManualCourse ? await prisma.studyContent.findMany({ where: { userId: session.user.id, courseId: course.id }, select: { id: true, title: true, description: true, studied: true, estimatedMinutes: true }, orderBy: { createdAt: "asc" } }) : []

  const googleAccounts = await prisma.account.findMany({
    where: { userId: session.user.id, providerId: "google" },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  })

  let topics: GoogleClassroomTopic[] = []
  let assignments: GoogleClassroomCourseWork[] = []
  let courseMaterials: GoogleClassroomCourseWorkMaterial[] = []
  let integrationError: string | null = null

  if (isManualCourse) {
    integrationError = null
  } else if (!googleAccounts.length) {
    integrationError = "Google Classroom não conectado."
  } else {
    const coursePath = `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(course.googleCourseId)}`
    let courseAccessible = false
    for (const googleAccount of googleAccounts) {
      try {
        const { accessToken } = await auth.api.getAccessToken({ body: { accountId: googleAccount.id }, headers: requestHeaders })
        const accessCheck = await fetch(coursePath, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store" })
        if (!accessCheck.ok) continue
        courseAccessible = true
        ;[topics, assignments, courseMaterials] = await Promise.all([
          fetchAllClassroomItems<GoogleClassroomTopic>(`${coursePath}/topics`, accessToken, "topic"),
          fetchAllClassroomItems<GoogleClassroomCourseWork>(`${coursePath}/courseWork`, accessToken, "courseWork"),
          fetchAllClassroomItems<GoogleClassroomCourseWorkMaterial>(`${coursePath}/courseWorkMaterials`, accessToken, "courseWorkMaterial"),
        ])
        integrationError = null
        break
      } catch {
        continue
      }
    }
    if (!courseAccessible) {
      integrationError = "Nenhuma conta Google vinculada possui acesso a esta turma. Sincronize com a conta correta ou remova a disciplina antiga."
    }
  }

  const assignmentsByTopic = new Map<string, GoogleClassroomCourseWork[]>()
  const materialsByTopic = new Map<
    string,
    GoogleClassroomCourseWorkMaterial[]
  >()

  for (const assignment of assignments) {
    const topicKey = assignment.topicId ?? "unassigned"
    const topicAssignments = assignmentsByTopic.get(topicKey) ?? []
    topicAssignments.push(assignment)
    assignmentsByTopic.set(topicKey, topicAssignments)
  }

  for (const material of courseMaterials) {
    const topicKey = material.topicId ?? "unassigned"
    const topicMaterials = materialsByTopic.get(topicKey) ?? []
    topicMaterials.push(material)
    materialsByTopic.set(topicKey, topicMaterials)
  }

  const knownTopicIds = new Set(topics.map((topic) => topic.topicId))
  const unassigned = assignments.filter(
    (assignment) => !assignment.topicId || !knownTopicIds.has(assignment.topicId)
  )
  const unassignedMaterials = courseMaterials.filter(
    (material) => !material.topicId || !knownTopicIds.has(material.topicId)
  )
  const itemKeys = [
    ...assignments.map((assignment) => `coursework:${assignment.id}`),
    ...courseMaterials.map((material) => `material:${material.id}`),
  ]
  let completedKeys = new Set<string>()

  if (!integrationError) {
    await prisma.$transaction([
      prisma.classroomCourse.update({
        where: { id: course.id },
        data: { totalItems: itemKeys.length },
      }),
      prisma.classroomItemCompletion.deleteMany({
        where: {
          userId: session.user.id,
          courseId: course.id,
          ...(itemKeys.length > 0 ? { itemKey: { notIn: itemKeys } } : {}),
        },
      }),
      prisma.classroomItemCompletion.createMany({
        data: itemKeys.map((itemKey) => ({
          userId: session.user.id,
          courseId: course.id,
          itemKey,
        })),
        skipDuplicates: true,
      }),
    ])

    const completedItems = await prisma.classroomItemCompletion.findMany({
      where: { userId: session.user.id, courseId: course.id, completed: true },
      select: { itemKey: true },
    })
    completedKeys = new Set(completedItems.map((item) => item.itemKey))
  }

  const totalItems = itemKeys.length
  const completedCount = completedKeys.size
  const progressPercent =
    totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0

  return (
    <main className="theme-page min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-8 text-[#111111] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/disciplinas"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-black/50 hover:text-black/80"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Minhas matérias
        </Link>

        {/* Header */}
        <header className="mb-8 rounded-3xl bg-black px-6 py-7 text-white sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-white/50">
                {course.section || (isManualCourse ? "Estudo pessoal" : "Google Classroom")}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                {course.name}
              </h1>
              <p className="mt-2 text-sm text-white/50">
                {isManualCourse ? "Organize seus estudos pessoais nesta matéria." : "Atividades organizadas pelos tópicos da disciplina."}
              </p>
            </div>

            {!integrationError && totalItems > 0 && (
              <div className="min-w-[160px]">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/50">Progresso</span>
                  <span className="font-semibold">{progressPercent}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10 sm:w-40">
                  <div
                    className="h-full rounded-full bg-lime-400"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-white/40">
                  {completedCount} de {totalItems} concluídos
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Atividades */}
        <section aria-labelledby="activities-title">
          {isManualCourse && <ManualCourseWorkspace courseId={course.id} initialContents={manualContents} />}
          {!isManualCourse && <>
          <h2 id="activities-title" className="mb-4 text-xl font-semibold">
            Atividades
          </h2>

          {integrationError && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {integrationError}
            </div>
          )}

          {!integrationError &&
            topics.length === 0 &&
            assignments.length === 0 &&
            courseMaterials.length === 0 && (
              <div className="rounded-3xl border border-dashed border-black/15 bg-white/60 p-8 text-center text-sm text-black/45">
                {isManualCourse ? "Matéria criada. Em breve você poderá adicionar atividades e materiais aqui." : "Nenhum tópico ou atividade foi encontrado nesta disciplina."}
              </div>
            )}

          {!integrationError && (
            <div className="space-y-5">
              {topics.map((topic) => (
                <TopicSection
                  key={topic.topicId}
                  title={topic.name}
                  courseId={course.id}
                  assignments={assignmentsByTopic.get(topic.topicId) ?? []}
                  materials={materialsByTopic.get(topic.topicId) ?? []}
                  completedKeys={completedKeys}
                />
              ))}

              {(unassigned.length > 0 || unassignedMaterials.length > 0) && (
                <TopicSection
                  title="Outros"
                  courseId={course.id}
                  assignments={unassigned}
                  materials={unassignedMaterials}
                  completedKeys={completedKeys}
                />
              )}
            </div>
          )}
          </>}
        </section>
      </div>
    </main>
  )
}

function TopicSection({
  title,
  courseId,
  assignments,
  materials,
  completedKeys,
}: {
  title: string
  courseId: string
  assignments: GoogleClassroomCourseWork[]
  materials: GoogleClassroomCourseWorkMaterial[]
  completedKeys: Set<string>
}) {
  const itemCount = assignments.length + materials.length

  return (
    <section className="overflow-hidden rounded-3xl border border-black/5 bg-white">
      <div className="border-b border-black/5 bg-black/[0.02] px-5 py-4 sm:px-6">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-black/45">
          {itemCount} {itemCount === 1 ? "item" : "itens"}
        </p>
      </div>

      {itemCount === 0 ? (
        <p className="px-5 py-5 text-sm text-black/45 sm:px-6">
          Nenhuma atividade neste tópico.
        </p>
      ) : (
        <div className="divide-y divide-black/5">
          {assignments.map((assignment) => {
            const activityUrl = getAssignmentUrl(assignment)
            const itemKey = `coursework:${assignment.id}`

            return (
              <article
                key={assignment.id}
                className="flex items-start gap-4 px-5 py-4 sm:px-6"
              >
                <CompletionCheckbox
                  courseId={courseId}
                  itemKey={itemKey}
                  initialCompleted={completedKeys.has(itemKey)}
                  label={`Marcar ${assignment.title} como concluída`}
                />
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-lime-400/20 text-lime-700">
                  <BookOpen className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium leading-6">
                    <Link
                      href={`/disciplinas/${courseId}/atividades/${assignment.id}`}
                      className="hover:underline"
                    >
                      {assignment.title}
                    </Link>
                  </h4>
                  {assignment.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-black/45">
                      {assignment.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/40">
                    {assignment.workType && <span>{assignment.workType}</span>}
                    {assignment.maxPoints != null && (
                      <span>{assignment.maxPoints} pontos</span>
                    )}
                  </div>
                </div>
                {activityUrl && (
                  <a
                    href={activityUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir recurso externo de ${assignment.title}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-black/50 transition-colors hover:bg-black/5 hover:text-black"
                  >
                    <span className="hidden sm:inline">Abrir atividade</span>
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                )}
              </article>
            )
          })}
          {materials.map((material) => {
            const materialUrl = getCourseWorkMaterialUrl(material)
            const itemKey = `material:${material.id}`

            return (
              <article
                key={`material-${material.id}`}
                className="flex items-start gap-4 px-5 py-4 sm:px-6"
              >
                <CompletionCheckbox
                  courseId={courseId}
                  itemKey={itemKey}
                  initialCompleted={completedKeys.has(itemKey)}
                  label={`Marcar ${material.title} como concluído`}
                />
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-700">
                  <FileText className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-black/40">
                    Material
                  </p>
                  <h4 className="mt-1 font-medium leading-6">
                    {material.title}
                  </h4>
                  {material.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-black/45">
                      {material.description}
                    </p>
                  )}
                </div>
                {materialUrl && (
                  <a
                    href={materialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir material ${material.title}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-black/50 transition-colors hover:bg-black/5 hover:text-black"
                  >
                    <span className="hidden sm:inline">Abrir material</span>
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
