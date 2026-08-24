"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

export function ConnectGoogleClassroom() {
  async function handleConnect() {
    await authClient.linkSocial({
      provider: "google",
    })
  }

  return (
    <Button onClick={handleConnect}>
      Conectar Google Classroom
    </Button>
  )
}