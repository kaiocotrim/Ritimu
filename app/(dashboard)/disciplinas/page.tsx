import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
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
        {courses.map((course) => (
          <Link
            href={`/disciplinas/${course.id}`}
            key={course.id}
            className="rounded-3xl border p-5"
          >
            <h2 className="font-medium">
              {course.name}
            </h2>

            {course.section && (
              <p className="mt-1 text-sm text-muted-foreground">
                {course.section}
              </p>
            )}
          </Link>
        ))}
      </div>
    </main>
  )
}
