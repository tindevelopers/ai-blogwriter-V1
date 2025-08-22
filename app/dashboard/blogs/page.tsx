
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BlogsManagement } from '@/components/dashboard/blogs-management'

export const dynamic = "force-dynamic"

export default async function BlogsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const [blogs, stores] = await Promise.all([
    prisma.blog.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        store: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),
    prisma.shopifyStore.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      select: {
        id: true,
        storeName: true,
        storeUrl: true
      }
    })
  ])

  return <BlogsManagement blogs={blogs} stores={stores} />
}
