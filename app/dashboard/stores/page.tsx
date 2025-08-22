
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { StoresManagement } from '@/components/dashboard/stores-management'

export const dynamic = "force-dynamic"

export default async function StoresPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const stores = await prisma.shopifyStore.findMany({
    where: {
      userId: session.user.id,
      isActive: true
    },
    include: {
      _count: {
        select: {
          blogs: true,
          articles: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return <StoresManagement stores={stores} />
}
