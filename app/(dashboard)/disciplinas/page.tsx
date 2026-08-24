import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SyncGoogleClassroom } from "@/components/integrations/sync-google-classroom"

export default async function DisciplinasPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const courses = await prisma.classroomCourse.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          itemCompletions: {
            where: { completed: true },
          },
        },
      },
    },
  })

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Minhas matérias
        </h1>

        <SyncGoogleClassroom />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const isCompleted =
            course.totalItems > 0 &&
            course._count.itemCompletions === course.totalItems

          return (
            <Link
              href={`/disciplinas/${course.id}`}
              key={course.id}
              className={`rounded-3xl border p-5 transition-colors ${
                isCompleted
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : "hover:bg-muted/40"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium">{course.name}</h2>
                {isCompleted && (
                  <CheckCircle2
                    className="size-5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                )}
              </div>

              {course.section && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.section}
                </p>
              )}

              {isCompleted && (
                <p className="mt-4 text-sm font-medium text-emerald-700">
                  Atividade finalizada
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </main>
  )
}
