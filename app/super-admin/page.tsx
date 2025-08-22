

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { SuperAdminOverview } from '@/components/super-admin/super-admin-overview'

export const dynamic = "force-dynamic"

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return null
  }

  // Fetch platform-wide statistics
  const [
    totalAgencies, 
    activeAgencies, 
    totalUsers, 
    totalStores,
    recentAgencies
  ] = await Promise.all([
    prisma.agency.count(),
    prisma.agency.count({
      where: { 
        isActive: true, 
        subscriptionStatus: 'active' 
      }
    }),
    prisma.user.count(),
    prisma.shopifyStore.count(),
    prisma.agency.findMany({
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        users: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  // Calculate estimated revenue (simplified)
  const agencies = await prisma.agency.findMany({
    where: { subscriptionStatus: 'active' },
    select: { subscriptionPlan: true }
  })

  const totalRevenue = agencies.reduce((acc, agency) => {
    const planRevenue = agency.subscriptionPlan === 'enterprise' ? 299 : 
                      agency.subscriptionPlan === 'pro' ? 99 : 29
    return acc + planRevenue
  }, 0)

  const stats = {
    totalAgencies,
    activeAgencies,
    totalUsers,
    totalStores,
    totalRevenue,
    monthlyGrowth: 12.5 // This would be calculated from historical data
  }

  const systemHealth = {
    database: 'healthy',
    llmServices: 'online',
    apiRateLimit: 85
  }

  return (
    <SuperAdminOverview 
      stats={stats}
      recentAgencies={recentAgencies}
      systemHealth={systemHealth}
    />
  )
}

