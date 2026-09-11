import { getCertificateByCode } from "@/lib/certificates/service"
import { isValidCertificateCode } from "@/lib/certificates/code"
import { renderCertificatePdf } from "@/lib/certificates/renderer"

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  if (!isValidCertificateCode(code)) {
    return Response.json({ error: "Código de certificado inválido." }, { status: 400 })
  }

  const cert = await getCertificateByCode(code)
  if (!cert) {
    return Response.json({ error: "Certificado não encontrado." }, { status: 404 })
  }

  try {
    const pdfBuffer = await renderCertificatePdf(cert)
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="certificado-${code}.pdf"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[certificate-pdf]", error)
    return Response.json({ error: "Erro ao gerar PDF do certificado." }, { status: 500 })
  }
}
