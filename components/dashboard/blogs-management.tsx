
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { 
  BookOpen, 
  Plus, 
  FileText, 
  Calendar,
  Loader2,
  Eye,
  Edit,
  MoreHorizontal
} from 'lucide-react'

interface Blog {
  id: string
  title: string
  description?: string | null
  status: string
  createdAt: Date | string
  updatedAt: Date | string
  store: {
    id: string
    storeName: string
    storeUrl: string
  }
  _count: {
    articles: number
  }
}

interface Store {
  id: string
  storeName: string
  storeUrl: string
}

interface BlogsManagementProps {
  blogs: Blog[]
  stores: Store[]
}

export function BlogsManagement({ blogs: initialBlogs, stores }: BlogsManagementProps) {
  const [blogs, setBlogs] = useState(initialBlogs)
  const [isCreating, setIsCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    storeId: ''
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Blog created successfully!"
        })
        
        // Add new blog to the list (you might want to refetch instead)
        setFormData({ title: '', description: '', storeId: '' })
        setShowForm(false)
        // Refresh the page to get updated data
        window.location.reload()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Blog creation error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create blog",
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleStoreChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      storeId: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Blogs</h1>
          <p className="text-gray-600">Manage your Shopify blogs and articles</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={stores.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Create Blog
        </Button>
      </div>

      {stores.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No stores connected</p>
                <p className="text-sm text-yellow-600">
                  You need to connect at least one Shopify store before creating blogs.
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/dashboard/stores">Connect Store</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Creation Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Blog</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="storeId">Shopify Store</Label>
                <Select value={formData.storeId} onValueChange={handleStoreChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.storeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="title">Blog Title</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter blog title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of your blog"
                />
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Blog
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Blogs List */}
      {blogs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No blogs created</h3>
            <p className="text-gray-600 mb-4">
              Create your first blog to start publishing articles
            </p>
            {stores.length > 0 && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Blog
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>{blog.title}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {blog.store.storeName} • {blog.status}
                      </p>
                      {blog.description && (
                        <p className="text-sm text-gray-500 mt-1">{blog.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/blogs/${blog.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/blogs/${blog.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{blog._count.articles}</span>
                      <span className="text-sm text-gray-600">articles</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Updated {typeof blog.updatedAt === 'string' 
                          ? new Date(blog.updatedAt).toLocaleDateString()
                          : blog.updatedAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button asChild size="sm">
                    <Link href={`/dashboard/articles/new?blogId=${blog.id}`}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Article
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
