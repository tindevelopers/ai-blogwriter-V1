
"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { 
  ShoppingBag, 
  Plus, 
  ExternalLink, 
  BarChart3, 
  FileText,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface Store {
  id: string
  storeName: string
  storeUrl: string
  isActive: boolean
  createdAt: Date
  _count: {
    blogs: number
    articles: number
  }
}

interface StoresManagementProps {
  stores: Store[]
}

export function StoresManagement({ stores: initialStores }: StoresManagementProps) {
  const [stores, setStores] = useState(initialStores)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    storeName: '',
    storeUrl: '',
    accessToken: ''
  })
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)

    try {
      const response = await fetch('/api/shopify/stores', {
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
          description: "Store connected successfully!"
        })
        
        // Add new store to the list
        const newStore = {
          ...result.data,
          createdAt: new Date(result.data.createdAt),
          _count: { blogs: 0, articles: 0 }
        }
        setStores(prev => [newStore, ...prev])
        setFormData({ storeName: '', storeUrl: '', accessToken: '' })
        setShowForm(false)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Store connection error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect store",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const testConnection = async (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    if (!store) return

    setTestingConnection(storeId)

    try {
      const response = await fetch('/api/shopify/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeUrl: store.storeUrl,
          accessToken: 'stored-token' // In real app, this would be from secure storage
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Connection Test",
          description: "Store connection is working!"
        })
      } else {
        toast({
          title: "Connection Test",
          description: "Store connection failed. Please check your credentials.",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Connection Test",
        description: "Failed to test connection",
        variant: "destructive"
      })
    } finally {
      setTestingConnection(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shopify Stores</h1>
          <p className="text-gray-600">Manage your connected Shopify stores</p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={isConnecting}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Store
        </Button>
      </div>

      {/* Connection Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Connect New Shopify Store</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  name="storeName"
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  placeholder="My Awesome Store"
                />
              </div>
              
              <div>
                <Label htmlFor="storeUrl">Store URL</Label>
                <Input
                  id="storeUrl"
                  name="storeUrl"
                  type="url"
                  required
                  value={formData.storeUrl}
                  onChange={handleChange}
                  placeholder="https://your-store.myshopify.com"
                />
              </div>

              <div>
                <Label htmlFor="accessToken">Admin API Access Token</Label>
                <Input
                  id="accessToken"
                  name="accessToken"
                  type="password"
                  required
                  value={formData.accessToken}
                  onChange={handleChange}
                  placeholder="shpat_xxxxxxxxxxxxxxxx"
                />
                <p className="text-sm text-gray-500 mt-1">
                  You can generate this in your Shopify admin under Apps & sales channels → Develop apps
                </p>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={isConnecting}>
                  {isConnecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Connect Store
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  disabled={isConnecting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stores List */}
      {stores.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No stores connected</h3>
            <p className="text-gray-600 mb-4">
              Connect your first Shopify store to start creating blogs and articles
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Your First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {stores.map((store) => (
            <Card key={store.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>{store.storeName}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{store.storeUrl}</span>
                        {store.isActive ? (
                          <span className="flex items-center space-x-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 text-red-600">
                            <XCircle className="h-3 w-3" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(store.id)}
                      disabled={testingConnection === store.id}
                    >
                      {testingConnection === store.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://${store.storeUrl}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{store._count.blogs}</p>
                      <p className="text-xs text-gray-600">Blogs</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{store._count.articles}</p>
                      <p className="text-xs text-gray-600">Articles</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Connected {store.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
