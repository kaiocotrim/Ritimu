import fs from "fs/promises"
import path from "path"
import sharp from "sharp"
import { PDFDocument } from "pdf-lib"

export interface CertificateRenderData {
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

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

/**
 * Calculates optimal font size for the student name
 * to ensure it always fits comfortably inside the 795px golden box.
 */
function calculateNameFontSize(name: string): number {
  const length = name.length
  if (length <= 20) return 36
  if (length <= 26) return 32
  if (length <= 32) return 27
  if (length <= 40) return 23
  return Math.max(18, Math.floor(700 / (length * 0.76)))
}

/**
 * Renders the certificate as a high-resolution PNG image (1448 x 1054).
 */
export async function renderCertificateImage(data: CertificateRenderData): Promise<Buffer> {
  const templatePath = path.join(process.cwd(), "public", "Certificado.png")
  const pixelFontPath = path.join(process.cwd(), "public", "fonts", "PixelifySans.ttf")
  const templateBuffer = await fs.readFile(templatePath)

  const studentName = escapeXml(data.studentName.toUpperCase().trim())
  const dateStr = escapeXml(formatDate(data.issuedAt))
  const scoreStr = `${data.score}/${data.totalQuestions} (${data.percentage}%)`
  const code = escapeXml(data.code)
  const fontSize = calculateNameFontSize(data.studentName)
  const nameLayer = await sharp({
    text: {
      text: `<span foreground="#1a2836" font_weight="bold" letter_spacing="2048">${studentName}</span>`,
      font: `Pixelify Sans Bold ${fontSize}`,
      fontfile: pixelFontPath,
      width: 760,
      height: 72,
      align: "center",
      rgba: true,
      wrap: "none",
    },
  }).png().toBuffer({ resolveWithObject: true })

  const svgOverlay = `
    <svg width="1448" height="1054" xmlns="http://www.w3.org/2000/svg">
      <style>
        .meta-text {
          font-family: 'Courier New', monospace, sans-serif;
          font-size: 15px;
          font-weight: 600;
          fill: #475a68;
          letter-spacing: 1px;
        }
        .code-text {
          font-family: 'Courier New', monospace, sans-serif;
          font-size: 13px;
          font-weight: 700;
          fill: #334656;
          letter-spacing: 1.5px;
        }
      </style>

      <!-- Date and Result centered between text and golden divider line (y=674) -->
      <text x="724" y="674" class="meta-text" text-anchor="middle">
        Concluído em ${dateStr}  ·  Aproveitamento: ${scoreStr}
      </text>

      <!-- Code centered between golden divider and cap (y=728) -->
      <text x="724" y="730" class="code-text" text-anchor="middle">
        CÓDIGO DE AUTENTICIDADE: ${code}
      </text>
    </svg>
  `

  return sharp(templateBuffer)
    .composite([
      { input: Buffer.from(svgOverlay), top: 0, left: 0 },
      {
        input: nameLayer.data,
        top: 536,
        left: Math.round(724 - nameLayer.info.width / 2),
      },
    ])
    .png({ quality: 100 })
    .toBuffer()
}

/**
 * Generates a high-quality landscape PDF document from the certificate.
 */
export async function renderCertificatePdf(data: CertificateRenderData): Promise<Buffer> {
  const imageBuffer = await renderCertificateImage(data)

  const pdfDoc = await PDFDocument.create()
  const pngImage = await pdfDoc.embedPng(imageBuffer)

  // Certificate native resolution page in landscape orientation
  const page = pdfDoc.addPage([1448, 1054])

  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: 1448,
    height: 1054,
  })

  pdfDoc.setTitle(`Certificado Ritimu - ${data.studentName} - ${data.roadmapName}`)
  pdfDoc.setAuthor("Ritimu")
  pdfDoc.setSubject("Certificado de Conclusão de Trilha de Estudos")
  pdfDoc.setKeywords(["Ritimu", "Certificado", data.roadmapName, data.code])
  pdfDoc.setCreationDate(typeof data.issuedAt === "string" ? new Date(data.issuedAt) : data.issuedAt)

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}
