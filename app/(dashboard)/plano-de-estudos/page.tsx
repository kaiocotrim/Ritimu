import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { Sidebar } from "@/components/sidebar/sidebar"
import { StudyPlanner } from "@/components/study-plan/study-planner"
import { GoogleCalendarConnect } from "@/components/study-plan/google-calendar-connect"
import { FloatingAgenda } from "@/components/study-plan/floating-agenda"
import { LostMascot } from "@/components/study-plan/lost-mascot"
import { SpacePhilosophers } from "@/components/study-plan/space-philosophers"
import { SpaceAlien } from "@/components/study-plan/space-alien"
import { SpaceEarth } from "@/components/study-plan/space-earth"
import { SpaceMoon } from "@/components/study-plan/space-moon"
import { SpaceSun } from "@/components/study-plan/space-sun"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getGoogleCalendarConnection } from "@/lib/google-calendar"

export default async function StudyPlanPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const [courses, google] = await Promise.all([
    prisma.classroomCourse.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getGoogleCalendarConnection(session.user.id),
  ])

  return (
    <main className="study-plan-theme-enter relative min-h-screen overflow-hidden bg-[#08090D] px-4 pb-32 pt-7 text-white sm:px-8 lg:px-12">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="study-plan-space-glow absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,#222631_0%,#0d0f15_42%,#08090d_78%)]" />
        <div className="absolute inset-0 bg-[url('/Estrelas.png')] bg-cover bg-center bg-no-repeat opacity-80" />
        <SpaceSun />
        <SpaceMoon />
        <SpaceEarth />
        <FloatingAgenda />
        <SpaceAlien />
        <LostMascot />
        <SpacePhilosophers />
      </div>
      <div className="study-plan-content relative z-10">
        <div className="fixed right-4 top-4 z-50 sm:right-8 sm:top-7"><GoogleCalendarConnect connected={google.connected} connectedEmail={google.email} /></div>
        <StudyPlanner initialCourses={courses} />
        <Sidebar />
      </div>
    </main>
  )
}
