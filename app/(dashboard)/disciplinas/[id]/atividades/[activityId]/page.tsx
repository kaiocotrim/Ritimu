import { ArrowLeft, ExternalLink, Paperclip } from "lucide-react"
import { headers } from "next/headers"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import type { GoogleClassroomCourseWork } from "@/lib/google-classroom"
import { getAssignmentUrl } from "@/lib/google-classroom-assignment"
import { prisma } from "@/lib/prisma"

export default async function AtividadePage({
  params,
}: {
  params: Promise<{ id: string; activityId: string }>
}) {
  const { id, activityId } = await params
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

  if (!googleAccount) {
    redirect(`/disciplinas/${course.id}`)
  }

  let accessToken: string

  try {
    const token = await auth.api.getAccessToken({
      body: { accountId: googleAccount.id },
      headers: requestHeaders,
    })
    accessToken = token.accessToken
  } catch {
    redirect(`/disciplinas/${course.id}`)
  }

  const response = await fetch(
    `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(course.googleCourseId)}/courseWork/${encodeURIComponent(activityId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  )

  if (!response.ok) {
    notFound()
  }

  const assignment = (await response.json()) as GoogleClassroomCourseWork
  const activityUrl = getAssignmentUrl(assignment)
  const dueAt = formatDueDate(assignment)

  return (
    <main className="theme-page min-h-screen bg-[#F6F5F1] px-4 pb-16 pt-8 text-[#111111] sm:px-8 lg:px-16">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          href={`/disciplinas/${course.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-black/50 hover:text-black/80"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para {course.name}
        </Link>

        <article className="mt-6 rounded-3xl border border-black/5 bg-white p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-lime-700">
                {assignment.workType ?? "Atividade"}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                {assignment.title}
              </h1>
            </div>

            {activityUrl && (
              <a
                href={activityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-lime-300"
              >
                Abrir atividade
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            )}
          </div>

          <dl className="mt-8 grid gap-4 border-y border-black/5 py-5 text-sm sm:grid-cols-3">
            <ActivityDetail label="Prazo" value={dueAt ?? "Sem prazo"} />
            <ActivityDetail
              label="Pontuação"
              value={
                assignment.maxPoints != null
                  ? `${assignment.maxPoints} pontos`
                  : "Não informada"
              }
            />
            <ActivityDetail
              label="Status"
              value={assignment.state ?? "Não informado"}
            />
          </dl>

          {assignment.description && (
            <section className="mt-8">
              <h2 className="font-semibold">Descrição</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-black/55">
                {assignment.description}
              </p>
            </section>
          )}

          {assignment.materials && assignment.materials.length > 0 && (
            <section className="mt-8">
              <h2 className="font-semibold">Materiais</h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-black/55">
                <Paperclip className="size-4" aria-hidden="true" />
                {assignment.materials.length}{" "}
                {assignment.materials.length === 1
                  ? "material associado"
                  : "materiais associados"}
              </p>
            </section>
          )}
        </article>
      </div>
    </main>
  )
}

function ActivityDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-black/45">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}

function formatDueDate(assignment: GoogleClassroomCourseWork) {
  if (!assignment.dueDate) return null

  const { year, month, day } = assignment.dueDate
  const hours = assignment.dueTime?.hours ?? 23
  const minutes = assignment.dueTime?.minutes ?? 59
  const dueDate = new Date(Date.UTC(year, month - 1, day, hours, minutes))

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    ...(assignment.dueTime ? { timeStyle: "short" as const } : {}),
    timeZone: "UTC",
  }).format(dueDate)
}
