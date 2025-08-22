
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  // Fetch user statistics
  const [totalStores, totalBlogs, totalArticles, publishedArticles, subscription] = await Promise.all([
    prisma.shopifyStore.count({
      where: { userId: session.user.id, isActive: true }
    }),
    prisma.blog.count({
      where: { userId: session.user.id }
    }),
    prisma.article.count({
      where: { userId: session.user.id }
    }),
    prisma.article.count({
      where: { userId: session.user.id, status: 'published' }
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id }
    })
  ])

  const draftArticles = totalArticles - publishedArticles

  const stats = {
    totalBlogs,
    totalArticles,
    publishedArticles,
    draftArticles,
    totalStores,
    monthlyUsage: subscription?.usedCredits || 0
  }

  // Fetch recent activities
  const recentBlogs = await prisma.blog.findMany({
    where: { userId: session.user.id },
    include: {
      store: true,
      _count: {
        select: { articles: true }
      }
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  })

  const recentArticles = await prisma.article.findMany({
    where: { userId: session.user.id },
    include: {
      blog: true,
      store: true
    },
    orderBy: { updatedAt: 'desc' },
    take: 5
  })

  return (
    <DashboardOverview 
      stats={stats}
      recentBlogs={recentBlogs}
      recentArticles={recentArticles}
      subscription={subscription}
      user={session.user}
    />
  )
}
