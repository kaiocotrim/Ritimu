import { BookOpen, ExternalLink } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

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

  const googleAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "google" },
    select: { id: true },
  })

  let topics: GoogleClassroomTopic[] = []
  let assignments: GoogleClassroomCourseWork[] = []
  let courseMaterials: GoogleClassroomCourseWorkMaterial[] = []
  let integrationError: string | null = null

  if (!googleAccount) {
    integrationError = "Google Classroom não conectado."
  } else {
    try {
      const { accessToken } = await auth.api.getAccessToken({
        body: { accountId: googleAccount.id },
        headers: requestHeaders,
      })
      const coursePath = `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(course.googleCourseId)}`

      ;[topics, assignments, courseMaterials] = await Promise.all([
        fetchAllClassroomItems<GoogleClassroomTopic>(
          `${coursePath}/topics`,
          accessToken,
          "topic"
        ),
        fetchAllClassroomItems<GoogleClassroomCourseWork>(
          `${coursePath}/courseWork`,
          accessToken,
          "courseWork"
        ),
        fetchAllClassroomItems<GoogleClassroomCourseWorkMaterial>(
          `${coursePath}/courseWorkMaterials`,
          accessToken,
          "courseWorkMaterial"
        ),
      ])
    } catch (error) {
      integrationError =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados do Google Classroom."
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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="border-b pb-8">
        <p className="text-sm font-medium text-muted-foreground">
          {course.section || "Google Classroom"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {course.name}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Atividades organizadas pelos tópicos da disciplina.
        </p>
      </header>

      <section className="mt-8" aria-labelledby="activities-title">
        <h2 id="activities-title" className="text-xl font-semibold">
          Atividades
        </h2>

        {integrationError && (
          <div className="mt-5 rounded-3xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
            {integrationError}
          </div>
        )}

        {!integrationError &&
          topics.length === 0 &&
          assignments.length === 0 &&
          courseMaterials.length === 0 && (
          <div className="mt-5 rounded-3xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            Nenhum tópico ou atividade foi encontrado nesta disciplina.
          </div>
        )}

        {!integrationError && (
          <div className="mt-5 space-y-5">
            {topics.map((topic) => (
              <TopicSection
                key={topic.topicId}
                title={topic.name}
                courseId={course.id}
                assignments={assignmentsByTopic.get(topic.topicId) ?? []}
                materials={materialsByTopic.get(topic.topicId) ?? []}
              />
            ))}

            {(unassigned.length > 0 || unassignedMaterials.length > 0) && (
              <TopicSection
                title="Outros"
                courseId={course.id}
                assignments={unassigned}
                materials={unassignedMaterials}
              />
            )}
          </div>
        )}
      </section>
    </main>
  )
}

function TopicSection({
  title,
  courseId,
  assignments,
  materials,
}: {
  title: string
  courseId: string
  assignments: GoogleClassroomCourseWork[]
  materials: GoogleClassroomCourseWorkMaterial[]
}) {
  return (
    <section className="overflow-hidden rounded-3xl border bg-card">
      <div className="border-b bg-muted/40 px-5 py-4 sm:px-6">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {assignments.length + materials.length}{" "}
          {assignments.length + materials.length === 1 ? "item" : "itens"}
        </p>
      </div>

      {assignments.length === 0 && materials.length === 0 ? (
        <p className="px-5 py-5 text-sm text-muted-foreground sm:px-6">
          Nenhuma atividade neste tópico.
        </p>
      ) : (
        <div className="divide-y">
          {assignments.map((assignment) => {
            const activityUrl = getAssignmentUrl(assignment)

            return (
              <article
                key={assignment.id}
                className="flex items-start gap-4 px-5 py-4 sm:px-6"
              >
              <div className="mt-0.5 rounded-2xl bg-muted p-2.5">
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
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {assignment.description}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

            return (
              <article
                key={`material-${material.id}`}
                className="flex items-start gap-4 px-5 py-4 sm:px-6"
              >
                <div className="mt-0.5 rounded-2xl bg-muted p-2.5">
                  <BookOpen className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Material
                  </p>
                  <h4 className="mt-1 font-medium leading-6">{material.title}</h4>
                  {material.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
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
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
