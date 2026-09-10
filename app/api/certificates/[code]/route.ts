import { getCertificateByCode } from "@/lib/certificates/service"
import { isValidCertificateCode } from "@/lib/certificates/code"

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  if (!isValidCertificateCode(code)) {
    return Response.json({ error: "Código de certificado inválido." }, { status: 400 })
  }

  const cert = await getCertificateByCode(code)
  if (!cert) {
    return Response.json({ error: "Certificado não encontrado." }, { status: 404 })
  }

  return Response.json(cert)
}
