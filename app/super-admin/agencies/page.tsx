

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { AgenciesManagement } from '@/components/super-admin/agencies-management'

export const dynamic = "force-dynamic"

export default async function AgenciesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return null
  }

  // Fetch all agencies with their related data
  const agencies = await prisma.agency.findMany({
    include: {
      owner: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true
        }
      },
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true
        }
      },
      _count: {
        select: {
          users: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return <AgenciesManagement agencies={agencies} />
}

