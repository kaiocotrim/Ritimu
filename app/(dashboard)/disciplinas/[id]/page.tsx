import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function DisciplinaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const course = await prisma.classroomCourse.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  })

  if (!course) {
    notFound()
  }

  return (
    <main className="p-6">
      <p className="text-sm text-muted-foreground">
        {course.section}
      </p>

      <h1 className="mt-1 text-3xl font-semibold">
        {course.name}
      </h1>

      <p className="mt-6">
        Google Course ID: {course.googleCourseId}
      </p>
    </main>
  )
}