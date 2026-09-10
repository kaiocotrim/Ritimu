"use client"

import { useState, useTransition } from "react"
import { Award, CheckCircle2, Download, FileText, ExternalLink, Image as ImageIcon } from "lucide-react"

interface CertificatePanelProps {
  roadmapId: string
  defaultName: string
}

interface IssuedCert {
  code: string
  studentName: string
  roadmapName: string
  score: number
  totalQuestions: number
  percentage: number
  issuedAt: string
}

export function CertificatePanel({ roadmapId, defaultName }: CertificatePanelProps) {
  const [name, setName] = useState(defaultName)
  const [cert, setCert] = useState<IssuedCert | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function issue() {
    const trimmed = name.trim()
    if (trimmed.length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres.")
      return
    }
    startTransition(async () => {
      setError(null)
      const response = await fetch("/api/certificates/issue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ roadmapId, studentName: trimmed }),
      })
      const body = await response.json() as { certificate?: IssuedCert; error?: string }
      if (!response.ok || !body.certificate) {
        setError(body.error ?? "Não foi possível emitir o certificado.")
        return
      }
      setCert(body.certificate)
    })
  }

  if (cert) {
    return (
      <div className="mt-4 space-y-4 rounded-none border-2 border-green-700 bg-green-50 p-5">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center bg-green-700 text-white">
            <Award className="size-5" />
          </span>
          <div>
            <p className="font-pixel text-[10px] font-bold uppercase tracking-widest text-green-700">
              Certificado emitido!
            </p>
            <p className="font-pixel mt-0.5 text-sm font-bold">{cert.studentName}</p>
            <p className="mt-0.5 font-mono text-xs text-black/50">{cert.code}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={`/api/certificates/${cert.code}/pdf`}
            download
            className="font-pixel flex flex-1 items-center justify-center gap-2 border-2 border-black bg-[#111820] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_#444] transition-transform hover:-translate-y-px"
          >
            <FileText className="size-3.5" />
            Baixar PDF
          </a>
          <a
            href={`/api/certificates/${cert.code}/image`}
            download
            className="font-pixel flex flex-1 items-center justify-center gap-2 border-2 border-black bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0_#111] transition-transform hover:-translate-y-px"
          >
            <ImageIcon className="size-3.5" />
            Baixar imagem
          </a>
        </div>

        <a
          href={`/verificar/${cert.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-pixel flex w-full items-center justify-center gap-2 border border-green-700/30 bg-white/60 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-green-700 transition-opacity hover:opacity-80"
        >
          <ExternalLink className="size-3" />
          Ver página de verificação
        </a>
      </div>
    )
  }

  return (
    <div className="mt-4 border-t border-green-700/20 pt-4">
      <p className="font-pixel flex items-center gap-2 text-sm font-bold text-amber-700">
        <CheckCircle2 className="size-5" /> Certificado disponível
      </p>
      <p className="mt-1 text-sm text-black/60">
        Você atingiu 100% na avaliação final. Informe o nome que deve constar no certificado.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          placeholder="Seu nome completo"
          className="font-pixel flex-1 border-2 border-black/20 bg-white px-3 py-2.5 text-sm focus:border-green-700 focus:outline-none"
        />
        <button
          type="button"
          onClick={issue}
          disabled={pending}
          className="font-pixel flex shrink-0 items-center gap-2 border-2 border-black bg-[#ffe46b] px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider shadow-[2px_2px_0_#111] disabled:opacity-60 transition-transform hover:-translate-y-px active:translate-y-0"
        >
          <Award className="size-3.5" />
          {pending ? "Emitindo..." : "Emitir certificado"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
