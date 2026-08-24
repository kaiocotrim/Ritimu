"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

type CompletionCheckboxProps = {
  courseId: string
  itemKey: string
  initialCompleted: boolean
  label: string
}

export function CompletionCheckbox({
  courseId,
  itemKey,
  initialCompleted,
  label,
}: CompletionCheckboxProps) {
  const router = useRouter()
  const [completed, setCompleted] = useState(initialCompleted)
  const [isSaving, setIsSaving] = useState(false)

  async function handleChange(nextCompleted: boolean) {
    setCompleted(nextCompleted)
    setIsSaving(true)

    const response = await fetch(`/api/classroom/progress/${courseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemKey, completed: nextCompleted }),
    }).catch(() => null)

    if (!response?.ok) {
      setCompleted(!nextCompleted)
    } else {
      router.refresh()
    }

    setIsSaving(false)
  }

  return (
    <label className="mt-1 inline-flex shrink-0 cursor-pointer items-center">
      <input
        type="checkbox"
        checked={completed}
        disabled={isSaving}
        onChange={(event) => handleChange(event.target.checked)}
        aria-label={label}
        className="size-5 cursor-pointer accent-emerald-600 disabled:cursor-wait"
      />
    </label>
  )
}
