import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/auth/logout-button"
import { ConnectGoogleClassroom } from "@/components/integrations/connect-google-classroom"

import { auth } from "@/lib/auth"

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <main>
      <h1>Dashboard</h1>

      <p>Olá, {session.user.name}</p>
      <ConnectGoogleClassroom />
      <LogoutButton />
    </main>
  )
}