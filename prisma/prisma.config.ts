import { PrismaClient } from '@prisma/client'

// Prisma 7: No datasources config, use direct URL in .env
const prisma = new PrismaClient()

export default prisma