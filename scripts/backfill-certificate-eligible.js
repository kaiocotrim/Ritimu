require('dotenv').config({ path: '.env' })
const { PrismaClient } = require('../lib/generated/prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const result = await prisma.roadmapAssessmentAttempt.updateMany({
    where: {
      correctAnswers: { gte: 45 },
      total: 50,
      certificateEligible: false,
      passed: true,
    },
    data: { certificateEligible: true },
  })
  console.log('Updated', result.count, 'attempt(s) to certificateEligible=true')
  await prisma.$disconnect()
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1) })
