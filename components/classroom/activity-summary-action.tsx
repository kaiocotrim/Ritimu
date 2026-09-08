"use client"

import { ExternalLink, Pencil, Plus } from "lucide-react"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { SummaryDialog } from "@/components/classroom/summary-dialog"
import { SummaryProviderIcon } from "@/components/classroom/summary-provider-icon"
import type { SummaryProvider } from "@/lib/activity-summary"

type SummaryLinks = { notionUrl: string | null; notebookLmUrl: string | null }

function SummaryLink({ url, provider, label, className }: {
  url: string
  provider: Exclude<SummaryProvider, "other">
  label: string
  className: string
}) {
  const hostname = new URL(url).hostname.replace(/^www\./, "")

  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      aria-label={`Abrir resumo no ${label}`}
      className={`group/link relative inline-flex h-8 items-center gap-2 whitespace-nowrap rounded-xl px-2.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 ${className}`}>
      <SummaryProviderIcon provider={provider} />
      <span className="flex-1 text-left">{label}</span>
      <ExternalLink className="size-3.5 opacity-65" aria-hidden="true" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-[calc(100%+10px)] right-0 z-30 w-56 origin-bottom-right translate-y-2 scale-95 overflow-hidden rounded-2xl border border-black/10 bg-white text-left text-black opacity-0 shadow-[0_18px_50px_rgba(0,0,0,0.18)] transition-all duration-200 group-hover/link:translate-y-0 group-hover/link:scale-100 group-hover/link:opacity-100 group-focus-visible/link:translate-y-0 group-focus-visible/link:scale-100 group-focus-visible/link:opacity-100">
        <span className={`flex h-24 items-center justify-center ${provider === "notion" ? "bg-[radial-gradient(circle_at_center,_#ede9fe,_#fafafa_68%)]" : "bg-[radial-gradient(circle_at_center,_#dbeafe,_#fafafa_68%)]"}`}>
          <span className="flex size-14 items-center justify-center rounded-2xl bg-white shadow-lg">
            <SummaryProviderIcon provider={provider} size={28} />
          </span>
        </span>
        <span className="block px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold"><SummaryProviderIcon provider={provider} />Resumo no {label}</span>
          <span className="mt-1 block truncate text-xs font-normal text-black/45">{hostname} · Abrir em nova aba</span>
        </span>
      </span>
    </a>
  )
}

export function ActivitySummaryAction({ courseId, itemKey, title, initialLinks }: {
  courseId: string
  itemKey: string
  title: string
  initialLinks: SummaryLinks
}) {
  const [links, setLinks] = useState(initialLinks)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const triggerRef = useRef<HTMLButtonElement>(null)
  const hasLinks = Boolean(links.notionUrl || links.notebookLmUrl)

  return (
    <div className="min-w-0">
      <div className={hasLinks ? "flex items-center gap-1 rounded-2xl border border-black/[0.06] bg-black/[0.025] p-1" : "flex items-center"}>
        {hasLinks && <div className="flex min-w-36 flex-col items-stretch gap-1">
          {links.notionUrl && (
            <SummaryLink url={links.notionUrl} provider="notion" label="Notion"
              className="bg-violet-100 text-violet-800 hover:bg-violet-200 focus-visible:outline-violet-600" />
          )}
          {links.notebookLmUrl && (
            <SummaryLink url={links.notebookLmUrl} provider="notebooklm" label="NotebookLM"
              className="bg-blue-50 text-blue-800 hover:bg-blue-100 focus-visible:outline-blue-600" />
          )}
        </div>}
        <Button ref={triggerRef} variant="outline" size={hasLinks ? "icon" : "default"}
          className={hasLinks ? "size-8 rounded-xl border-0 bg-white shadow-xs hover:bg-white" : "h-9 rounded-xl border-black/10 bg-white px-3 shadow-none"} aria-label={hasLinks ? `Editar resumos de ${title}` : `Adicionar resumo de ${title}`}
          onClick={() => { setMessage(""); setOpen(true) }}>
          {hasLinks ? <Pencil aria-hidden="true" /> : <><Plus aria-hidden="true" />Adicionar resumo</>}
        </Button>
      </div>
      <p role="status" className="sr-only">{message}</p>
      {open && <SummaryDialog courseId={courseId} itemKey={itemKey} title={title} initialLinks={links}
        onClose={() => { setOpen(false); triggerRef.current?.focus() }}
        onSaved={(nextLinks) => {
          setLinks(nextLinks)
          setMessage(nextLinks.notionUrl || nextLinks.notebookLmUrl ? "Resumos salvos." : "Resumos removidos.")
        }} />}
    </div>
  )
}
