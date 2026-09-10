
"use client"

import type { PointerEvent as ReactPointerEvent } from "react"
import { useMemo, useRef, useState, useTransition } from "react"
import { Check, ExternalLink, List, LoaderCircle, LockKeyhole, Map as MapIcon, Play, Search, X } from "lucide-react"
import Image from "next/image"
import { RoadmapCanvas } from "@/components/roadmaps/roadmap-canvas"
import { FullStackAssessment } from "@/components/roadmaps/full-stack/full-stack-assessment"
import { SelectedCharacterAvatar } from "@/components/roadmaps/selected-character-avatar"
import { FULL_STACK_ROADMAP_DEFINITION, type FullStackNode } from "@/lib/roadmaps/full-stack/definition"
import { cn } from "@/lib/utils"

type NodeProgress = { key: string; lessonId: string; completed: boolean }
type Result = { correctAnswers: number; total: 50; percentage: number; passed: boolean; certificateEligible: boolean }
type ViewMode = "map" | "list"
type ListCategory = "all" | "frontend" | "backend" | "database" | "devops"
type NodePosition = { x: number; y: number }
type NodeDrag = { key: string; startX: number; startY: number; origin: NodePosition; moved: boolean }

const sectionTheme = {
  frontend: { topic: "border-blue-600 bg-blue-100 hover:bg-blue-200", checkpoint: "border-blue-500 bg-blue-950", icon: "bg-blue-600", flag: "text-blue-300", label: "border-blue-600 text-blue-800 shadow-[0_7px_16px_rgba(37,99,235,.16)]" },
  backend: { topic: "border-green-600 bg-green-100 hover:bg-green-200", checkpoint: "border-green-500 bg-green-950", icon: "bg-green-600", flag: "text-green-300", label: "border-green-600 text-green-800 shadow-[0_7px_16px_rgba(22,163,74,.16)]" },
  devops: { topic: "border-red-600 bg-red-100 hover:bg-red-200", checkpoint: "border-red-500 bg-red-950", icon: "bg-red-600", flag: "text-red-300", label: "border-red-600 text-red-800 shadow-[0_7px_16px_rgba(220,38,38,.16)]" },
} as const

const sectionSpacing = { frontend: 0, backend: 180, devops: 450 } as const
const roadmapLogoBase = "/logos_recortadas_roadmap"
const nodeLogos: Record<string, string> = {
  html: "logoHTML.png", css: "logoCSS.png", javascript: "logoJavaScript.png", npm: "logoNpm.png", git: "logoGit.png", github: "logoGitHub.png", "tailwind-css": "logoTailwindCSS.png", react: "logoReact.png",
  "checkpoint-static-webpages": "logoCheckpointEstiloDeWebpages.png", "checkpoint-interactivity": "logoCheckpointInteratividade.png", "checkpoint-external-packages": "logoCheckpointExternalPackages.png", "checkpoint-collaborative-work": "logoCheckpointCollaborativeWork.png", "checkpoint-frontend-apps": "logoCheckpointFrontendApps.png",
  "node-js": "logoNodeJs.png", postgresql: "logoPostgreSQL.png", "restful-apis": "logoRESTfulAPIs.png", "jwt-auth": "logoJWTAuth.png", "orm-prisma": "logoORMPrisma.png", redis: "logoRedis.png",
  "checkpoint-cli-apps": "logoCheckpointCLIApps.png", "checkpoint-simple-crud": "logoCheckpointSimpleCRUDApps.png", "checkpoint-complete-app": "logoCheckpointCompleteApp.png",
  "linux-basics": "logoLinuxBasics.png", "basic-aws-services": "logoDockerContainerization.png", ec2: "logoCICD.png", vpc: "logoVPS.png", s3: "logoNginx.png", "route-53": "logoRoute53.png", ses: "logoSSL.png", monit: "logoMonitoring.png", "github-actions": "logoGitHubActions.png", ansible: "logoScalability.png", terraform: "logoTerraform.png",
  "checkpoint-deployment": "logoCheckpointDeployments.png", "checkpoint-monitoring": "logoCheckpointMonitoring.png", "checkpoint-cicd": "logoCheckpointCICD.png", "checkpoint-automation": "logoCheckpointAutomation.png", "checkpoint-infrastructure": "logoCheckpointInfrastructure.png",
}
const sectionLogos = { frontend: "logoFrontend.png", backend: "logoBackend.png", devops: "logoDevops.png" } as const

export function FullStackRoadmap({ roadmapId, progress, initialResult }: { roadmapId: string; progress: NodeProgress[]; initialResult: Result | null }) {
  const [selected, setSelected] = useState<FullStackNode | null>(null)
  const [completed, setCompleted] = useState(() => new Set(progress.filter((item) => item.completed).map((item) => item.key)))
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("map")
  const [listCategory, setListCategory] = useState<ListCategory>("all")
  const [search, setSearch] = useState("")
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>(() => Object.fromEntries(FULL_STACK_ROADMAP_DEFINITION.nodes.map((node) => [node.key, { x: node.position.x + sectionSpacing[node.section], y: node.position.y }])))
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const nodeDrag = useRef<NodeDrag | null>(null)
  const [pending, startTransition] = useTransition()
  const lessonIds = useMemo(() => new Map(progress.map((item) => [item.key, item.lessonId])), [progress])
  const unlocked = completed.size === FULL_STACK_ROADMAP_DEFINITION.nodes.length
  const currentNodeKey = useMemo(() => {
    const next = FULL_STACK_ROADMAP_DEFINITION.nodes.find((node) => {
      if (completed.has(node.key)) return false
      const prerequisites = FULL_STACK_ROADMAP_DEFINITION.edges.filter((edge) => edge.to === node.key).map((edge) => edge.from)
      return prerequisites.length === 0 || prerequisites.every((key) => completed.has(key))
    })
    return next?.key ?? FULL_STACK_ROADMAP_DEFINITION.nodes.at(-1)?.key
  }, [completed])

  function beginNodeDrag(event: ReactPointerEvent<HTMLButtonElement>, node: FullStackNode) {
    if (event.button !== 0) return
    event.stopPropagation()
    const position = nodePositions[node.key]
    nodeDrag.current = { key: node.key, startX: event.clientX, startY: event.clientY, origin: position, moved: false }
    setDraggingNode(node.key)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveNode(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = nodeDrag.current
    if (!drag) return
    event.stopPropagation()
    const scale = event.currentTarget.getBoundingClientRect().width / event.currentTarget.offsetWidth
    const dx = (event.clientX - drag.startX) / scale
    const dy = (event.clientY - drag.startY) / scale
    if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true
    setNodePositions((current) => ({ ...current, [drag.key]: {
      x: drag.origin.x + dx,
      y: drag.origin.y + dy,
    } }))
  }

  function endNodeDrag(event: ReactPointerEvent<HTMLButtonElement>, node: FullStackNode) {
    const drag = nodeDrag.current
    if (!drag || drag.key !== node.key) return
    event.stopPropagation()
    event.currentTarget.releasePointerCapture(event.pointerId)
    nodeDrag.current = null
    setDraggingNode(null)
    if (!drag.moved) {
      setSelected(node)
      setError(null)
    }
  }

  function complete() {
    if (!selected || completed.has(selected.key)) return
    const lessonId = lessonIds.get(selected.key)
    if (!lessonId) return setError("Este nó ainda não foi sincronizado. Recarregue a página.")
    startTransition(async () => {
      setError(null)
      const response = await fetch(`/api/roadmaps/${roadmapId}/lessons/${lessonId}/complete`, { method: "POST" })
      const body = await response.json().catch(() => null) as { error?: string } | null
      if (!response.ok) return setError(body?.error ?? "Não foi possível salvar o progresso.")
      setCompleted((current) => new Set(current).add(selected.key))
    })
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-[#172017] bg-white p-4 shadow-[4px_4px_0_#172017]">
      <div><p className="font-pixel text-xs font-bold uppercase">Progresso do conteúdo</p><p className="mt-1 text-sm text-black/55">{completed.size} de {FULL_STACK_ROADMAP_DEFINITION.nodes.length} conceitos/checkpoints</p></div>
      <strong className="font-pixel text-2xl text-[#299d37]">{Math.round(completed.size / FULL_STACK_ROADMAP_DEFINITION.nodes.length * 100)}%</strong>
      <div className="h-3 w-full overflow-hidden rounded-full bg-black/10"><div className="h-full bg-[#50d05c] transition-all" style={{ width: `${completed.size / FULL_STACK_ROADMAP_DEFINITION.nodes.length * 100}%` }} /></div>
      {unlocked && <p className="font-pixel w-full text-center text-xs font-bold uppercase text-blue-700">100% do conteúdo · avaliação final desbloqueada</p>}
    </div>

    <RoadmapViewToolbar viewMode={viewMode} onViewModeChange={setViewMode} category={listCategory} onCategoryChange={setListCategory} search={search} onSearchChange={setSearch} />

    {viewMode === "map" ? <RoadmapCanvas width={FULL_STACK_ROADMAP_DEFINITION.width} height={FULL_STACK_ROADMAP_DEFINITION.height}>
      <div className="relative h-full w-full bg-transparent">
        <SectionLabel title="Frontend" section="frontend" x={230} /><SectionLabel title="Backend" section="backend" x={970} /><SectionLabel title="DevOps" section="devops" x={1865} />
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs><marker id="full-stack-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#2878ff" /></marker></defs>
          {FULL_STACK_ROADMAP_DEFINITION.edges.map((edge, index) => {
            const from = FULL_STACK_ROADMAP_DEFINITION.nodes.find((node) => node.key === edge.from)!
            const to = FULL_STACK_ROADMAP_DEFINITION.nodes.find((node) => node.key === edge.to)!
            const center = (node: FullStackNode) => ({ x: nodePositions[node.key].x + (node.kind === "CHECKPOINT" ? 105 : 85), y: nodePositions[node.key].y + 28 })
            const a = center(from), b = center(to), midY = a.y + (b.y - a.y) / 2
            const path = `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`
            return <g key={`${edge.from}-${edge.to}`}>
              <path d={path} fill="none" stroke="#1473ff" strokeWidth="2" strokeDasharray={edge.style === "dashed" ? "7 6" : undefined} />
              <path className="roadmap-flow-line" d={path} fill="none" stroke="#8fc0ff" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 16" style={{ animationDelay: `${index * -90}ms` }} />
            </g>
          })}
        </svg>
        {FULL_STACK_ROADMAP_DEFINITION.nodes.map((node) => {
          const done = completed.has(node.key)
          const theme = sectionTheme[node.section]
          return <button key={node.key} type="button" onPointerDown={(event) => beginNodeDrag(event, node)} onPointerMove={moveNode} onPointerUp={(event) => endNodeDrag(event, node)} onPointerCancel={(event) => endNodeDrag(event, node)} onClick={(event) => { if (event.detail === 0) { setSelected(node); setError(null) } }} aria-label={`${node.title}. ${done ? "Concluído. Arraste para mover ou clique para revisar" : "Arraste para mover ou clique para abrir"}`} className={cn("font-pixel absolute z-10 flex min-h-14 cursor-move touch-none items-center justify-center gap-3 rounded-sm border px-3 py-2 text-center text-[10px] font-bold leading-4 outline-none shadow-[0_8px_18px_rgba(20,35,55,.14)] transition-[box-shadow,background-color,border-color] focus-visible:ring-4 focus-visible:ring-blue-400", node.kind === "TOPIC" ? cn("w-42.5", theme.topic) : cn("w-52.5 border-2 text-white", theme.checkpoint), done && "ring-2 ring-white/80", draggingNode === node.key && "z-30 cursor-grabbing ring-4 ring-blue-400 shadow-[0_14px_28px_rgba(20,115,255,.28)]")} style={{ left: nodePositions[node.key].x, top: nodePositions[node.key].y }}>
            {currentNodeKey === node.key && <span className="pointer-events-none absolute -top-15 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center"><span className="mb-0.5 whitespace-nowrap rounded-full bg-[#071d31] px-2 py-1 text-[7px] uppercase tracking-wide text-white shadow-sm">Você está aqui</span><span className="relative size-12 drop-shadow-[0_4px_2px_rgba(0,0,0,.28)]"><SelectedCharacterAvatar alt="Seu personagem na etapa atual" fill sizes="48px" className="object-contain" /></span></span>}
            <Image src={`${roadmapLogoBase}/${nodeLogos[node.key]}`} alt="" width={48} height={48} draggable={false} className={cn("shrink-0 object-contain", node.kind === "TOPIC" ? "size-9" : "h-10 w-12")} />{done && node.kind === "CHECKPOINT" && <span className="sr-only">Concluído</span>}<span>{node.title}</span>
          </button>
        })}
      </div>
    </RoadmapCanvas> : <FullStackListView completed={completed} category={listCategory} search={search} onSelect={(node) => { setSelected(node); setError(null) }} />}

    <FullStackAssessment roadmapId={roadmapId} unlocked={unlocked} initialResult={initialResult} />
    {selected && <><button type="button" aria-label="Fechar painel" onClick={() => setSelected(null)} className="fixed inset-0 z-[110] bg-[#071d23]/40" /><aside role="dialog" aria-modal="true" aria-labelledby="topic-title" className="fixed inset-y-0 right-0 z-[120] w-[min(100vw,430px)] overflow-y-auto border-l-2 border-black bg-white p-6 shadow-2xl sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="font-pixel text-[10px] font-bold uppercase tracking-widest text-[#299d37]">{selected.kind === "TOPIC" ? "Conceito" : "Checkpoint"}</p><h2 id="topic-title" className="font-pixel mt-2 text-2xl font-bold">{selected.title}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Fechar painel" className="grid size-10 place-items-center border-2 border-black focus-visible:ring-4 focus-visible:ring-blue-400"><X className="size-5" /></button></div>
      <p className="mt-5 leading-7 text-black/65">{selected.description}</p>
      {selected.resources.length > 0 && <section className="mt-7"><h3 className="font-pixel text-xs font-bold uppercase tracking-wider">Recursos gratuitos</h3><div className="mt-3 space-y-3">{selected.resources.map((resource) => <a key={resource.url} href={resource.url} target="_blank" rel="noopener noreferrer" className="group block border-2 border-black/15 p-4 transition hover:border-[#2878ff] focus-visible:ring-4 focus-visible:ring-blue-400"><span className="font-pixel text-[9px] font-bold uppercase text-blue-700">{resource.provider} · {resource.kind}</span><strong className="font-pixel mt-2 flex items-center justify-between gap-3 text-xs leading-5">{resource.title}<ExternalLink className="size-4 shrink-0" /></strong></a>)}</div></section>}
      {selected.kind === "CHECKPOINT" && <p className="mt-6 border border-black/10 bg-black/5 p-4 text-sm">Use este checkpoint para construir algo com os conceitos anteriores. Quando se sentir seguro, marque-o como entendido.</p>}
      <button type="button" onClick={complete} disabled={pending || completed.has(selected.key)} className="font-pixel mt-8 flex w-full items-center justify-center gap-2 border-2 border-black bg-[#50d05c] px-4 py-4 text-xs font-bold uppercase shadow-[3px_3px_0_#111] disabled:bg-[#dff7df] disabled:opacity-80">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Check className="size-4" />}{completed.has(selected.key) ? "Conceito entendido" : "Eu entendi este conceito"}</button>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p>}
      {completed.has(selected.key) && <p className="mt-3 text-center text-sm text-black/50">Os recursos permanecem disponíveis para revisão.</p>}
    </aside></>}
  </div>
}

function SectionLabel({ title, section, x }: { title: string; section: FullStackNode["section"]; x: number }) {
  return <div className={cn("absolute top-2 z-20 w-45 rounded-md border-2 bg-white px-3 py-2", sectionTheme[section].label)} style={{ left: x }}><Image src={`${roadmapLogoBase}/${sectionLogos[section]}`} alt={title} width={180} height={54} draggable={false} className="h-9 w-full object-contain" /></div>
}

const listGroups = [
  { key: "frontend" as const, title: "Frontend", subtitle: "Interface e experiência", icon: "/logoDosConceitos/FT1.png", accent: "text-blue-600", panel: "from-blue-50 to-blue-50/30", border: "border-blue-200" },
  { key: "backend" as const, title: "Backend", subtitle: "Servidor e APIs", icon: "/logoDosConceitos/BK1.png", accent: "text-violet-600", panel: "from-violet-50 to-violet-50/30", border: "border-violet-200" },
  { key: "database" as const, title: "Banco de dados", subtitle: "Persistência e cache", icon: "/logoDosConceitos/SGBD1.png", accent: "text-amber-600", panel: "from-amber-50 to-amber-50/30", border: "border-amber-200" },
  { key: "devops" as const, title: "DevOps", subtitle: "Cloud e automação", icon: "/logoDosConceitos/NV1.png", accent: "text-red-500", panel: "from-red-50 to-red-50/30", border: "border-red-200" },
]

function nodeListCategory(node: FullStackNode): Exclude<ListCategory, "all"> {
  if (node.section === "frontend") return "frontend"
  if (node.section === "devops") return "devops"
  if (node.key === "postgresql" || node.key === "redis") return "database"
  return "backend"
}

function RoadmapViewToolbar({ viewMode, onViewModeChange, category, onCategoryChange, search, onSearchChange }: {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  category: ListCategory
  onCategoryChange: (category: ListCategory) => void
  search: string
  onSearchChange: (value: string) => void
}) {
  const filters: { key: ListCategory; label: string; className: string }[] = [
    { key: "all", label: "Todos", className: "bg-green-600 text-white border-green-700" },
    { key: "frontend", label: "Frontend", className: "bg-blue-50 text-blue-700 border-blue-200" },
    { key: "backend", label: "Backend", className: "bg-violet-50 text-violet-700 border-violet-200" },
    { key: "database", label: "Banco de dados", className: "bg-amber-50 text-amber-700 border-amber-200" },
    { key: "devops", label: "DevOps", className: "bg-red-50 text-red-700 border-red-200" },
  ]
  return <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-3 shadow-sm lg:flex-row lg:items-center">
    <label className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"><Search className="size-4 text-black/40" /><span className="sr-only">Buscar conceito</span><input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar um conceito..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/35" /></label>
    <div className="flex flex-wrap gap-1.5" aria-label="Filtrar áreas">{filters.map((filter) => <button key={filter.key} type="button" aria-pressed={category === filter.key} onClick={() => onCategoryChange(filter.key)} className={cn("font-pixel rounded-md border px-3 py-2 text-[9px] font-bold transition focus-visible:ring-2 focus-visible:ring-blue-400", category === filter.key ? filter.className : "border-black/10 bg-white text-black/50 hover:bg-black/5")}>{filter.label}</button>)}</div>
    <div className="flex shrink-0 rounded-lg border border-black/10 bg-[#f4f5f5] p-1" aria-label="Modo de visualização">
      <button type="button" aria-pressed={viewMode === "map"} onClick={() => onViewModeChange("map")} className={cn("font-pixel flex items-center gap-1.5 rounded-md px-3 py-2 text-[9px] font-bold", viewMode === "map" ? "bg-green-600 text-white shadow-sm" : "text-black/45")}><MapIcon className="size-3.5" /> Mapa</button>
      <button type="button" aria-pressed={viewMode === "list"} onClick={() => onViewModeChange("list")} className={cn("font-pixel flex items-center gap-1.5 rounded-md px-3 py-2 text-[9px] font-bold", viewMode === "list" ? "bg-green-600 text-white shadow-sm" : "text-black/45")}><List className="size-3.5" /> Lista</button>
    </div>
  </div>
}

function FullStackListView({ completed, category, search, onSelect }: { completed: ReadonlySet<string>; category: ListCategory; search: string; onSelect: (node: FullStackNode) => void }) {
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR")
  const groups = listGroups.filter((group) => category === "all" || category === group.key).map((group) => ({
    ...group,
    nodes: FULL_STACK_ROADMAP_DEFINITION.nodes.filter((node) => nodeListCategory(node) === group.key && (!normalizedSearch || `${node.title} ${node.description}`.toLocaleLowerCase("pt-BR").includes(normalizedSearch))),
  })).filter((group) => group.nodes.length > 0)

  if (groups.length === 0) return <div className="rounded-xl border-2 border-dashed border-black/15 bg-white px-6 py-16 text-center"><Search className="mx-auto size-7 text-black/25" /><p className="font-pixel mt-3 text-xs font-bold">Nenhum conceito encontrado</p><p className="mt-1 text-sm text-black/45">Tente outro termo ou selecione outra área.</p></div>

  return <section aria-label="Roadmap Full Stack em lista" className="grid items-start gap-4 md:grid-cols-2 lg:grid-cols-4">
    {groups.map((group) => {
      const doneCount = group.nodes.filter((node) => completed.has(node.key)).length
      return <article key={group.key} className={cn("rounded-xl border bg-gradient-to-b p-4", group.panel, group.border)}>
        <header className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg bg-white shadow-sm">
            <Image src={group.icon} alt={group.title} width={24} height={24} className="size-6 object-contain" />
          </span>
          <div>
            <h3 className="font-pixel text-xs font-bold uppercase">{group.title}</h3>
            <p className="mt-0.5 text-xs text-black/45">{doneCount}/{group.nodes.length} etapas</p>
          </div>
        </header>
        <div className="space-y-0">{group.nodes.map((node, index) => {
          const done = completed.has(node.key)
          const prerequisites = FULL_STACK_ROADMAP_DEFINITION.edges.filter((edge) => edge.to === node.key).map((edge) => edge.from)
          const available = prerequisites.length === 0 || prerequisites.every((key) => completed.has(key))
          const StatusIcon = done ? Check : available ? Play : LockKeyhole
          return <div key={node.key} className="relative pb-6 last:pb-0">
            {index < group.nodes.length - 1 && <span aria-hidden="true" className={cn("absolute left-1/2 top-full h-6 -translate-x-1/2 -translate-y-6 border-l-2", available ? "border-solid border-blue-500" : "border-dashed border-black/35")}><span className="absolute -bottom-0.5 -left-1 text-[10px] text-blue-600">↓</span></span>}
            <button type="button" onClick={() => onSelect(node)} aria-label={`${node.title}. ${done ? "Concluído. Abrir para revisar" : "Abrir conteúdo"}`} className={cn("group flex min-h-14 w-full items-center gap-3 rounded-md border px-3 py-2 text-left shadow-sm outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-4 focus-visible:ring-blue-300", done ? "border-green-500 bg-green-50" : available ? "border-blue-500 bg-white" : "border-black/15 bg-[#f2f3f3] text-black/60")}>
              <Image src={`${roadmapLogoBase}/${nodeLogos[node.key]}`} alt="" width={44} height={44} className="size-10 shrink-0 object-contain" /><span className="font-pixel min-w-0 flex-1 text-[10px] font-bold leading-4">{node.title}</span><span className={cn("grid size-6 shrink-0 place-items-center rounded text-white", done ? "bg-green-600" : available ? "bg-blue-600" : "bg-slate-500")} aria-hidden="true"><StatusIcon className="size-3.5" /></span>
            </button>
          </div>
        })}</div>
      </article>
    })}
  </section>
}
