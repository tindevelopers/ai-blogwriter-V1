
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, FileText, Clock, CheckCircle2, Edit } from 'lucide-react'
import { notFound } from 'next/navigation'

export const dynamic = "force-dynamic"

interface ArticlePageProps {
  params: { id: string }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const article = await prisma.article.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      blog: true,
      store: true,
      seoData: true
    }
  })

  if (!article) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/articles">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Articles
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{article.title}</h1>
            <p className="text-gray-600">{article.blog.title} • {article.store.storeName}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/articles/${article.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          {article.status === 'published' ? (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-800 rounded-md">
              <CheckCircle2 className="h-4 w-4" />
              <span>Published</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-100 text-orange-800 rounded-md">
              <Clock className="h-4 w-4" />
              <span>Draft</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Article Content</CardTitle>
            </CardHeader>
            <CardContent>
              {article.excerpt && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Excerpt</h3>
                  <p className="text-gray-600 italic">{article.excerpt}</p>
                </div>
              )}
              <div 
                className="prose prose-blue max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Slug</label>
                <p className="font-mono text-sm">{article.slug}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="capitalize">{article.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Created</label>
                <p>{new Date(article.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Updated</label>
                <p>{new Date(article.updatedAt).toLocaleDateString()}</p>
              </div>
              {article.publishedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Published</label>
                  <p>{new Date(article.publishedAt).toLocaleDateString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {article.seoData && (
            <Card>
              <CardHeader>
                <CardTitle>SEO Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {article.seoData.metaTitle && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Meta Title</label>
                    <p>{article.seoData.metaTitle}</p>
                  </div>
                )}
                {article.seoData.metaDescription && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Meta Description</label>
                    <p className="text-sm">{article.seoData.metaDescription}</p>
                  </div>
                )}
                {article.seoData.focusKeyword && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Focus Keyword</label>
                    <p>{article.seoData.focusKeyword}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
