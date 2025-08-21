
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

export const dynamic = "force-dynamic"

interface EditBlogPageProps {
  params: { id: string }
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/blogs/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Blog</h1>
          <p className="text-gray-600">Update your blog settings and configuration</p>
        </div>
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Blog Editor Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            Blog editing functionality with title, description, and category management is currently under development.
          </p>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/blogs/${params.id}`}>
              View Blog Details
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
