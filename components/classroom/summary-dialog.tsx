"use client"

import { X } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SummaryProviderIcon } from "@/components/classroom/summary-provider-icon"
import { normalizeSummaryUrl, SUMMARY_URL_ERROR } from "@/lib/activity-summary"

type SummaryLinks = { notionUrl: string | null; notebookLmUrl: string | null }

export function SummaryDialog({ courseId, itemKey, title, initialLinks, onClose, onSaved }: {
  courseId: string
  itemKey: string
  title: string
  initialLinks: SummaryLinks
  onClose: () => void
  onSaved: (links: SummaryLinks) => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const busyRef = useRef(false)
  const id = useId()
  const [notionUrl, setNotionUrl] = useState(initialLinks.notionUrl ?? "")
  const [notebookLmUrl, setNotebookLmUrl] = useState(initialLinks.notebookLmUrl ?? "")
  const [saving, setSaving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const dialog = dialogRef.current
    dialog?.showModal()
    return () => dialog?.close()
  }, [])

  function close() {
    dialogRef.current?.close()
    onClose()
  }

  async function save(remove: boolean) {
    if (busyRef.current) return
    const normalizedNotionUrl = remove || !notionUrl.trim() ? null : normalizeSummaryUrl(notionUrl)
    const normalizedNotebookLmUrl = remove || !notebookLmUrl.trim() ? null : normalizeSummaryUrl(notebookLmUrl)
    if (!remove && !normalizedNotionUrl && !normalizedNotebookLmUrl) { setError("Informe ao menos um link válido."); return }
    if (!remove && notionUrl.trim() && !normalizedNotionUrl) { setError(`Notion: ${SUMMARY_URL_ERROR}`); return }
    if (!remove && notebookLmUrl.trim() && !normalizedNotebookLmUrl) { setError(`NotebookLM: ${SUMMARY_URL_ERROR}`); return }
    busyRef.current = true
    setSaving(true)
    setError("")
    try {
      const response = await fetch(`/api/classroom/courses/${encodeURIComponent(courseId)}/summaries`, {
        method: remove ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemKey, summaryUrl: normalizedNotionUrl, notebookLmUrl: normalizedNotebookLmUrl }),
      })
      const data: unknown = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(data && typeof data === "object" && "error" in data && typeof data.error === "string"
          ? data.error : remove ? "Não foi possível remover o resumo." : "Não foi possível salvar o resumo.")
      }
      onSaved({ notionUrl: normalizedNotionUrl, notebookLmUrl: normalizedNotebookLmUrl })
      close()
    } catch (cause) {
      setError(cause instanceof Error && !(cause instanceof TypeError) ? cause.message
        : remove ? "Não foi possível remover o resumo." : "Não foi possível salvar o resumo.")
    } finally {
      busyRef.current = false
      setSaving(false)
    }
  }

  return (
    <dialog ref={dialogRef} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
      onCancel={(event) => { event.preventDefault(); if (!busyRef.current) close() }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[360px] overflow-y-auto rounded-2xl border border-black/5 bg-white p-5 text-[#111111] shadow-xl backdrop:bg-black/20 backdrop:backdrop-blur-[2px]">
      <div className="flex items-start justify-between gap-3">
        <h2 id={`${id}-title`} className="pt-0.5 text-sm font-semibold leading-5">{initialLinks.notionUrl || initialLinks.notebookLmUrl ? "Editar resumos" : "Adicionar resumos"}</h2>
        <Button type="button" variant="ghost" size="icon-xs" aria-label="Fechar" disabled={saving}
          onClick={close} className="-mr-1 -mt-0.5 shrink-0 rounded-md text-black/40 hover:text-black/70">
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <p id={`${id}-description`} className="mt-2 text-xs leading-relaxed text-black/45">Adicione seus links do Notion e do NotebookLM para esta atividade.</p>
      <p className="sr-only">{title}</p>
      <form noValidate onSubmit={(event) => { event.preventDefault(); void save(confirmRemove) }}>
        <label htmlFor={`${id}-notion`} className="mt-5 block text-xs font-medium">Link do Notion</label>
        <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 shadow-xs focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100 has-[[aria-invalid=true]]:border-red-500">
          <SummaryProviderIcon provider="notion" size={18} />
          <Input id={`${id}-notion`} type="url" autoFocus value={notionUrl} disabled={saving || confirmRemove}
            placeholder="https://www.notion.so/..." className="h-10 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-black/35 focus-visible:ring-0"
            aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => { setNotionUrl(event.target.value); setError("") }} />
        </div>
        <label htmlFor={`${id}-notebooklm`} className="mt-4 block text-xs font-medium">Link do NotebookLM</label>
        <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 shadow-xs focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 has-[[aria-invalid=true]]:border-red-500">
          <SummaryProviderIcon provider="notebooklm" size={18} />
          <Input id={`${id}-notebooklm`} type="url" value={notebookLmUrl} disabled={saving || confirmRemove}
            placeholder="https://notebook.google.com/..." className="h-10 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-black/35 focus-visible:ring-0"
            aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
            onChange={(event) => { setNotebookLmUrl(event.target.value); setError("") }} />
        </div>
        {error && <p id={`${id}-error`} role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        {confirmRemove && <p role="alert" className="mt-4 text-sm text-black/65">Remover o link deste resumo? A página externa continuará existindo.</p>}
        <div className="mt-5 flex flex-col gap-3 border-t border-black/5 pt-4">
          {(initialLinks.notionUrl || initialLinks.notebookLmUrl) && !confirmRemove && (
            <Button type="button" variant="destructive" className="h-9 rounded-lg text-xs" disabled={saving}
              onClick={() => { setConfirmRemove(true); setError("") }}>Remover resumo</Button>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" className="h-9 rounded-lg border-black/5 bg-black/[0.025] text-xs" disabled={saving}
              onClick={() => { if (confirmRemove) { setConfirmRemove(false); setError("") } else close() }}>Cancelar</Button>
            <Button type="submit" variant={confirmRemove ? "destructive" : "default"} className="h-9 min-w-0 rounded-lg text-xs" disabled={saving}>
              {saving ? (confirmRemove ? "Removendo..." : "Salvando...") : confirmRemove ? "Confirmar remoção" : initialLinks.notionUrl || initialLinks.notebookLmUrl ? "Salvar alterações" : "Salvar"}
            </Button>
          </div>
        </div>
      </form>
    </dialog>
  )
}
