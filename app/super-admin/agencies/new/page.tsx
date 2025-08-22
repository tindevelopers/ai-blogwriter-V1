

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { CreateAgencyForm } from '@/components/super-admin/create-agency-form'

export default async function NewAgencyPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return null
  }

  return <CreateAgencyForm />
}

