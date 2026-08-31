import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar/sidebar"
import { X1Home } from "@/components/x1/x1-home"
import { auth } from "@/lib/auth"
import { getDuelDashboard } from "@/lib/x1/service"

export default async function X1Page() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  const initialData = await getDuelDashboard(session.user.id)
  return <main className="min-h-screen bg-[#F6F5F1] px-4 pb-32 pt-10 text-[#111] sm:px-8 sm:pt-12"><X1Home initialData={initialData} /><Sidebar /></main>
}
