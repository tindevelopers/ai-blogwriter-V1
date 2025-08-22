
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Plus, FileText, Edit, Eye } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = "force-dynamic"

interface BlogPageProps {
  params: { id: string }
}

export default async function BlogPage({ params }: BlogPageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const blog = await prisma.blog.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      store: true,
      articles: {
        orderBy: { updatedAt: 'desc' }
      }
    }
  })

  if (!blog) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/blogs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{blog.title}</h1>
            <p className="text-gray-600">{blog.store.storeName} • {blog.status}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href={`/dashboard/articles/new?blogId=${blog.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Article
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/blogs/${blog.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Blog
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Blog Info */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Title</label>
                <p className="font-medium">{blog.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Store</label>
                <p>{blog.store.storeName}</p>
              </div>
              {blog.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p>{blog.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="capitalize">{blog.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Articles</label>
                <p>{blog.articles.length} articles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Articles</CardTitle>
              <Button asChild size="sm">
                <Link href={`/dashboard/articles/new?blogId=${blog.id}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {blog.articles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No articles yet</h3>
                <p className="text-gray-600 mb-4">
                  Start creating SEO-optimized content for this blog
                </p>
                <Button asChild>
                  <Link href={`/dashboard/articles/new?blogId=${blog.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Article
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {blog.articles.map((article: any) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{article.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="capitalize">{article.status}</span>
                        <span>{new Date(article.updatedAt).toLocaleDateString()}</span>
                        {article.publishedAt && (
                          <span>Published {new Date(article.publishedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/articles/${article.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/articles/${article.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
