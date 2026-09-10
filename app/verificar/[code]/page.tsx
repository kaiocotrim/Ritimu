import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCertificateByCode } from "@/lib/certificates/service"
import { isValidCertificateCode } from "@/lib/certificates/code"
import { CertificateVerifyView } from "@/components/certificates/certificate-verify-view"

interface Props {
  params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params
  if (!isValidCertificateCode(code)) return { title: "Certificado Inválido – Ritimu" }

  const cert = await getCertificateByCode(code)
  if (!cert) return { title: "Certificado não encontrado – Ritimu" }

  return {
    title: `Certificado de ${cert.studentName} – Ritimu`,
    description: `Certificado de conclusão da trilha ${cert.roadmapName} emitido pela Ritimu em ${new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(cert.issuedAt))}.`,
    openGraph: {
      title: `Certificado de ${cert.studentName}`,
      description: `Trilha ${cert.roadmapName} · 100% de aproveitamento`,
      images: [`/api/certificates/${code}/image`],
    },
  }
}

export default async function CertificateVerifyPage({ params }: Props) {
  const { code } = await params

  if (!isValidCertificateCode(code)) notFound()

  const cert = await getCertificateByCode(code)
  if (!cert) notFound()

  return <CertificateVerifyView cert={cert} code={code} />
}
