import { PrismaClient } from "@/lib/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const globalForPrisma = globalThis as unknown as {
  prismaPlannerV5: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prismaPlannerV5 ??
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaPlannerV5 = prisma
}
