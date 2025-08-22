
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  FileText, 
  BookOpen, 
  ShoppingBag, 
  TrendingUp,
  PlusCircle,
  Eye,
  Clock,
  CheckCircle2
} from 'lucide-react'

interface DashboardOverviewProps {
  stats: {
    totalBlogs: number
    totalArticles: number
    publishedArticles: number
    draftArticles: number
    totalStores: number
    monthlyUsage: number
  }
  recentBlogs: any[]
  recentArticles: any[]
  subscription: any
  user: any
}

export function DashboardOverview({
  stats,
  recentBlogs,
  recentArticles,
  subscription,
  user
}: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg px-6 py-8 text-white">
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-blue-100 mt-2">
          Ready to create more SEO-optimized content for your Shopify stores?
        </p>
        <div className="mt-4 flex space-x-4">
          <Button asChild variant="secondary">
            <Link href="/dashboard/articles/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Article
            </Link>
          </Button>
          <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
            <Link href="/dashboard/stores">
              Connect Store
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Blogs</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBlogs}</div>
            <p className="text-xs text-muted-foreground">
              Across all your stores
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedArticles} published, {stats.draftArticles} drafts
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Stores</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStores}</div>
            <p className="text-xs text-muted-foreground">
              Active Shopify stores
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.usedCredits || 0}/{subscription?.blogCredits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Blog credits used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Blogs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Blogs</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/blogs">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentBlogs?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No blogs created yet</p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/dashboard/blogs/new">Create Your First Blog</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBlogs?.slice(0, 3)?.map((blog) => (
                  <div key={blog?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">{blog?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {blog?.store?.storeName} • {blog?._count?.articles || 0} articles
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/blogs/${blog?.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Articles</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard/articles">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentArticles?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No articles created yet</p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/dashboard/articles/new">Write Your First Article</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentArticles?.slice(0, 3)?.map((article) => (
                  <div key={article?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {article?.status === 'published' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-orange-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{article?.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {article?.blog?.title} • {article?.status}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/articles/${article?.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/stores/new">
                <ShoppingBag className="h-6 w-6 mb-2" />
                <span>Connect New Store</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/blogs/new">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Create Blog</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-20 flex-col">
              <Link href="/dashboard/articles/new">
                <FileText className="h-6 w-6 mb-2" />
                <span>Write Article</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
