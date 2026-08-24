"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await authClient.signOut()

    router.push("/login")
    router.refresh()
  }

  return (
    <Button onClick={handleLogout}>
      Sair
    </Button>
  )
}