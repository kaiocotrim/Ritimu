"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/ui/button"

export function SyncGoogleClassroom() {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSync() {
    setIsSyncing(true)
    setError(null)

    try {
      const response = await fetch("/api/classroom/sync", { method: "POST" })
      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error ?? "Não foi possível sincronizar as matérias")
      }

      router.refresh()
    } catch (syncError) {
      setError(
        syncError instanceof Error
          ? syncError.message
          : "Não foi possível sincronizar as matérias"
      )
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleSync} disabled={isSyncing}>
        {isSyncing ? "Sincronizando..." : "Sincronizar Google Classroom"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
