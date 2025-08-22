
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function NewArticlePage() {
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
        store: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),
    prisma.shopifyStore.count({
      where: {
        userId: session.user.id,
        isActive: true
      }
    })
  ])

  if (stores === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Article</h1>
            <p className="text-gray-600">Write SEO-optimized content for your Shopify store</p>
          </div>
        </div>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No stores connected</p>
                <p className="text-sm text-yellow-600 mt-1">
                  You need to connect at least one Shopify store and create a blog before you can write articles.
                </p>
                <div className="mt-3 flex space-x-3">
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/stores">Connect Store</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/blogs">Create Blog</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (blogs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Create New Article</h1>
            <p className="text-gray-600">Write SEO-optimized content for your Shopify store</p>
          </div>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm font-medium text-blue-800">No blogs found</p>
                <p className="text-sm text-blue-600 mt-1">
                  You need to create at least one blog before you can write articles.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/dashboard/blogs">Create Your First Blog</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/articles">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Article</h1>
          <p className="text-gray-600">Write SEO-optimized content for your Shopify store</p>
        </div>
      </div>

      <Card className="text-center py-12">
        <CardContent>
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Article Editor Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            The full article editor with AI-powered content generation, SEO optimization, and keyword integration is currently under development.
          </p>
          <div className="space-y-2">
            <h4 className="font-medium">Available Blogs:</h4>
            <div className="space-y-2">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{blog.title}</p>
                      <p className="text-sm text-gray-600">{blog.store.storeName}</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Create Article (Coming Soon)
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
