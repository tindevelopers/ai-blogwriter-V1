
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function NewBlogPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/blogs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blogs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Blog</h1>
          <p className="text-gray-600">Set up a new blog for your Shopify store</p>
        </div>
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Blog Creation Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            The blog creation form is currently available on the main blogs page. This dedicated page will have enhanced features soon.
          </p>
          <Button asChild>
            <Link href="/dashboard/blogs">
              Go to Blogs Page
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
