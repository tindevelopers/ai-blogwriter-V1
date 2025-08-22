
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FileText, Plus, Eye, Edit, Clock, CheckCircle2 } from 'lucide-react'

export const dynamic = "force-dynamic"

export default async function ArticlesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const articles = await prisma.article.findMany({
    where: {
      userId: session.user.id
    },
    include: {
      blog: true,
      store: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Articles</h1>
          <p className="text-gray-600">Manage your blog articles across all stores</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/articles/new">
            <Plus className="h-4 w-4 mr-2" />
            New Article
          </Link>
        </Button>
      </div>

      {articles.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No articles created</h3>
            <p className="text-gray-600 mb-4">
              Create your first article to start publishing SEO-optimized content
            </p>
            <Button asChild>
              <Link href="/dashboard/articles/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Article
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      {article.status === 'published' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle>{article.title}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {article.blog.title} • {article.store.storeName} • {article.status}
                      </p>
                      {article.excerpt && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
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
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-6">
                    <div className="text-sm text-gray-600">
                      Slug: <span className="font-mono text-blue-600">{article.slug}</span>
                    </div>
                    {article.publishedAt && (
                      <div className="text-sm text-gray-600">
                        Published: {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Updated {new Date(article.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
