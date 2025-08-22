

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { SuperAdminNav } from '@/components/super-admin/super-admin-nav'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  
  // Check if user exists and has SUPER_ADMIN role
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SuperAdminNav user={session.user} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}

