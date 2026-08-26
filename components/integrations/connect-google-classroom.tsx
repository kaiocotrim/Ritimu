"use client"

import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { GOOGLE_CLASSROOM_SCOPES } from "@/lib/google-classroom"

export function ConnectGoogleClassroom() {
  async function handleConnect() {
    await authClient.linkSocial({
      provider: "google",
      callbackURL: "/dashboard",
      scopes: [...GOOGLE_CLASSROOM_SCOPES],
      additionalParams: {
        prompt: "consent",
        access_type: "offline",
      },
    })
  }

  return (
    <Button onClick={handleConnect}>
      Conectar Google Classroom
    </Button>
  )
}
