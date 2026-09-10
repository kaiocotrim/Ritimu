"use client"

import { useState } from "react"
import Link from "next/link"
import { Download, ExternalLink, CheckCircle2, FileText, Image as ImageIcon, Shield } from "lucide-react"

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
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verificar/${code}`

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/verificar/${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#faf9f0] px-4 py-12 text-[#111820]">
      {/* Header */}
      <header className="mx-auto mb-10 flex max-w-2xl items-center justify-between">
        <Link href="/" className="font-pixel flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#111820] opacity-70 hover:opacity-100 transition-opacity">
          ← Ritimu
        </Link>
        <span className="font-pixel flex items-center gap-1.5 rounded-full border border-green-700/30 bg-green-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-green-700">
          <Shield className="size-3" /> Verificado
        </span>
      </header>

      {/* Certificate Card */}
      <main className="mx-auto max-w-2xl">
        {/* Hero verification banner */}
        <div className="mb-6 flex items-start gap-4 rounded-2xl border-2 border-green-700/20 bg-green-50 p-6">
          <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-green-700 text-white">
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
        <div className="mb-6 overflow-hidden rounded-2xl border-2 border-[#172017] shadow-[6px_6px_0_#172017]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/certificates/${code}/image`}
            alt={`Certificado de ${cert.studentName}`}
            className="w-full"
            loading="lazy"
          />
        </div>

        {/* Details */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Trilha", value: cert.roadmapName },
            { label: "Nota", value: `${cert.score}/${cert.totalQuestions} (${cert.percentage}%)` },
            { label: "Emitido em", value: formatDate(cert.issuedAt) },
            { label: "Código", value: code },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-black/10 bg-white p-4">
              <p className="font-pixel text-[9px] font-bold uppercase tracking-widest text-black/40">{label}</p>
              <p className="font-pixel mt-1 text-xs font-bold break-all">{value}</p>
            </div>
          ))}
        </div>

        {/* Download buttons */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
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
        <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white p-3">
          <ExternalLink className="size-4 shrink-0 text-black/40" />
          <span className="flex-1 truncate font-mono text-xs text-black/50">
            {typeof window !== "undefined" ? `${window.location.origin}/verificar/${code}` : `/verificar/${code}`}
          </span>
          <button
            type="button"
            onClick={copyLink}
            className="font-pixel shrink-0 rounded-lg border border-black/15 bg-black/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:bg-black/10"
          >
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-black/30">
          Este certificado foi emitido pela <strong>Ritimu</strong> e pode ser verificado a qualquer momento nesta página.
        </p>
      </main>
    </div>
  )
}
