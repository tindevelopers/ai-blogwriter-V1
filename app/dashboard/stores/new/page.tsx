
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function NewStorePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/stores">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stores
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Connect New Store</h1>
          <p className="text-gray-600">Connect your Shopify store to start creating blogs</p>
        </div>
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Store Connection Available</h3>
          <p className="text-gray-600 mb-4">
            The store connection form is available on the main stores page. This dedicated page will have enhanced features soon.
          </p>
          <Button asChild>
            <Link href="/dashboard/stores">
              Go to Stores Page
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
