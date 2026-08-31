import { prisma } from "@/lib/prisma"
import { requireX1UserId } from "@/lib/x1/auth"

function maskEmail(email: string) {
  const [local, domain] = email.split("@")
  if (!domain) return "E-mail protegido"
  return `${local.slice(0, 1)}${"•".repeat(Math.min(4, Math.max(2, local.length - 1)))}@${domain}`
}

export async function GET(request: Request) {
  const userId = await requireX1UserId()
  if (!userId) return Response.json({ error: "Não autenticado." }, { status: 401 })
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? ""
  if (query.length < 2) return Response.json({ users: [] })
  const users = await prisma.user.findMany({
    where: { id: { not: userId }, OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }] },
    select: { id: true, name: true, email: true, image: true },
    orderBy: { name: "asc" },
    take: 8,
  })
  return Response.json({ users: users.map(({ email, ...user }) => ({ ...user, maskedEmail: maskEmail(email) })) })
}
