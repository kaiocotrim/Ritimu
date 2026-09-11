"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, CalendarDays, CheckCircle2, FileText, Hash, Image as ImageIcon, Link2, Shield, Trophy } from "lucide-react"

interface CertData {
  code: string
  studentName: string
  roadmapName: string
  score: number
  totalQuestions: number
  percentage: number
  issuedAt: Date | string
}

function formatDate(dateInput: Date | string): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(date)
}

export function CertificateVerifyView({ cert, code }: { cert: CertData; code: string }) {
  const [copied, setCopied] = useState(false)
  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/verificar/${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbfaf1] px-4 py-5 text-[#0b2037] sm:px-7">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_8%_55%,#d5c5a3_0_3px,transparent_4px),radial-gradient(circle_at_91%_9%,#d5c5a3_0_3px,transparent_4px),radial-gradient(circle_at_94%_68%,#d5c5a3_0_3px,transparent_4px)]" />
      <p aria-hidden className="font-pixel pointer-events-none absolute right-[5%] top-16 hidden text-[9px] font-bold uppercase leading-4 tracking-[.25em] text-black/20 xl:block">Estude.<br />Evolua.<br />Conquiste.</p>
      <p aria-hidden className="font-pixel pointer-events-none absolute bottom-24 left-[4%] hidden text-xs font-bold uppercase tracking-[.25em] text-black/20 xl:block">Ritimu</p>
      {/* Header */}
      <header className="relative mx-auto mb-5 flex max-w-4xl items-center justify-between border-b-2 border-[#0b2037] pb-3">
        <Link href="/" className="font-pixel flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#111820] opacity-70 hover:opacity-100 transition-opacity">
          ← Ritimu
        </Link>
        <span className="font-pixel flex items-center gap-1.5 border-2 border-green-800 bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green-800 shadow-[2px_2px_0_rgba(21,128,61,.25)]">
          <Shield className="size-3" /> Verificado
        </span>
      </header>

      {/* Certificate Card */}
      <main className="relative mx-auto max-w-4xl">
        {/* Hero verification banner */}
        <div className="relative mb-5 flex items-center gap-5 border-2 border-green-800 bg-[#effcf2] px-7 py-4 shadow-[inset_0_0_24px_rgba(22,163,74,.06)]">
          <i aria-hidden className="absolute left-[-2px] top-[-2px] size-3 border-l-4 border-t-4 border-green-800" />
          <i aria-hidden className="absolute right-[-2px] top-[-2px] size-3 border-r-4 border-t-4 border-green-800" />
          <i aria-hidden className="absolute bottom-[-2px] left-[-2px] size-3 border-b-4 border-l-4 border-green-800" />
          <i aria-hidden className="absolute bottom-[-2px] right-[-2px] size-3 border-b-4 border-r-4 border-green-800" />
          <span className="grid size-16 shrink-0 place-items-center bg-green-700 text-white">
            <CheckCircle2 className="size-7" />
          </span>
          <div>
            <p className="font-pixel text-[10px] font-bold uppercase tracking-widest text-green-700">
              Certificado autêntico
            </p>
            <h1 className="font-pixel mt-1 text-2xl font-bold leading-tight text-[#111820]">
              {cert.studentName}
            </h1>
            <p className="mt-1 text-sm text-black/60">
              Concluiu a trilha <strong>{cert.roadmapName}</strong> com{" "}
              <strong>{cert.percentage}% de aproveitamento</strong>.
            </p>
          </div>
        </div>

        {/* Certificate preview */}
        <div className="mb-5 overflow-hidden border-2 border-[#0b2037] shadow-[6px_6px_0_#0b2037]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/certificates/${code}/image`}
            alt={`Certificado de ${cert.studentName}`}
            className="w-full"
            loading="lazy"
          />
        </div>

        {/* Details */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Trilha", value: cert.roadmapName, icon: BookOpen },
            { label: "Nota", value: `${cert.score}/${cert.totalQuestions} (${cert.percentage}%)`, icon: Trophy },
            { label: "Emitido em", value: formatDate(cert.issuedAt), icon: CalendarDays },
            { label: "Código", value: code, icon: Hash },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex min-h-20 items-start gap-3 border border-[#0b2037]/35 bg-white/80 p-4 shadow-[1px_1px_0_rgba(11,32,55,.2)]">
              <Icon className="mt-0.5 size-5 shrink-0" />
              <div><p className="font-pixel text-[9px] font-bold uppercase tracking-widest text-black/45">{label}</p><p className="font-pixel mt-1 break-all text-[11px] font-bold leading-4">{value}</p></div>
            </div>
          ))}
        </div>

        {/* Download buttons */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <a
            href={`/api/certificates/${code}/pdf`}
            download
            className="font-pixel flex flex-1 items-center justify-center gap-2 border-2 border-black bg-[#111820] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_#444] transition-transform hover:-translate-y-px active:translate-y-0"
          >
            <FileText className="size-4" />
            Baixar PDF
          </a>
          <a
            href={`/api/certificates/${code}/image`}
            download
            className="font-pixel flex flex-1 items-center justify-center gap-2 border-2 border-black bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0_#111] transition-transform hover:-translate-y-px active:translate-y-0"
          >
            <ImageIcon className="size-4" />
            Baixar imagem
          </a>
        </div>

        {/* Share / copy link */}
        <div className="flex items-center gap-3 border border-[#0b2037]/30 bg-white/80 p-3">
          <Link2 className="size-4 shrink-0 text-[#0b2037]/50" />
          <span suppressHydrationWarning className="flex-1 truncate font-mono text-xs text-[#0b2037]/50">
            {typeof window !== "undefined" ? `${window.location.origin}/verificar/${code}` : `/verificar/${code}`}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="font-pixel shrink-0 border border-[#0b2037]/40 bg-[#f4f7f8] px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest shadow-[1px_1px_0_rgba(11,32,55,.25)] transition-colors hover:bg-white"
          >
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>

        <div className="mt-6 flex items-center gap-5 text-black/30"><span className="h-px flex-1 bg-current" /><span className="size-1 rotate-45 bg-current" /><p className="text-center text-xs">Este certificado foi emitido pela <strong>Ritimu</strong> e pode ser verificado a qualquer momento nesta página.</p><span className="size-1 rotate-45 bg-current" /><span className="h-px flex-1 bg-current" /></div>
      </main>
    </div>
  )
}
