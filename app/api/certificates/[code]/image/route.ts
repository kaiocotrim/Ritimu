import { getCertificateByCode } from "@/lib/certificates/service"
import { isValidCertificateCode } from "@/lib/certificates/code"
import { renderCertificateImage } from "@/lib/certificates/renderer"

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
    const imageBuffer = await renderCertificateImage(cert)
    return new Response(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="certificado-${code}.png"`,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    })
  } catch (error) {
    console.error("[certificate-image]", error)
    return Response.json({ error: "Erro ao gerar imagem do certificado." }, { status: 500 })
  }
}
