

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import { Building, User, Settings, Palette } from 'lucide-react'

export function CreateAgencyForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    slug: '',
    description: '',
    
    // Owner Info
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPassword: '',
    
    // Subscription
    subscriptionPlan: 'starter',
    billingEmail: '',
    maxUsers: 5,
    maxStores: 10,
    maxBlogCredits: 100,
    
    // White-label Settings
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    hideOurBranding: false,
    customSupportEmail: '',
    
    // API Settings
    allowCustomLlm: false,
    allowApiAccess: false,
    apiRateLimit: 1000
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData(prev => ({
        ...prev,
        slug: slug
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/super-admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const agency = await response.json()
        toast.success('Agency created successfully!')
        router.push(`/super-admin/agencies/${agency.id}`)
      } else {
        const error = await response.text()
        throw new Error(error)
      }
    } catch (error) {
      console.error('Error creating agency:', error)
      toast.error('Failed to create agency')
    } finally {
      setIsLoading(false)
    }
  }

  const planConfigs = {
    starter: { users: 5, stores: 10, credits: 100 },
    pro: { users: 25, stores: 50, credits: 500 },
    enterprise: { users: 100, stores: 200, credits: 2000 }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create New Agency</h2>
        <p className="text-muted-foreground">
          Set up a new agency with their own white-label dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Agency Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Acme Marketing Agency"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="acme-marketing"
                    required
                  />
                  <Badge variant="outline" className="text-xs">
                    .yourdomain.com
                  </Badge>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="A brief description of the agency"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Agency Owner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Agency Owner</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerFirstName">First Name</Label>
                <Input
                  id="ownerFirstName"
                  value={formData.ownerFirstName}
                  onChange={(e) => handleInputChange('ownerFirstName', e.target.value)}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerLastName">Last Name</Label>
                <Input
                  id="ownerLastName"
                  value={formData.ownerLastName}
                  onChange={(e) => handleInputChange('ownerLastName', e.target.value)}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Email</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  placeholder="john@acme.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerPassword">Temporary Password</Label>
                <Input
                  id="ownerPassword"
                  type="password"
                  value={formData.ownerPassword}
                  onChange={(e) => handleInputChange('ownerPassword', e.target.value)}
                  placeholder="Temporary password"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Subscription & Limits</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subscriptionPlan">Subscription Plan</Label>
                <Select 
                  value={formData.subscriptionPlan} 
                  onValueChange={(value) => {
                    handleInputChange('subscriptionPlan', value)
                    const config = planConfigs[value as keyof typeof planConfigs]
                    handleInputChange('maxUsers', config.users)
                    handleInputChange('maxStores', config.stores)
                    handleInputChange('maxBlogCredits', config.credits)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter ($29/month)</SelectItem>
                    <SelectItem value="pro">Pro ($99/month)</SelectItem>
                    <SelectItem value="enterprise">Enterprise ($299/month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingEmail">Billing Email</Label>
                <Input
                  id="billingEmail"
                  type="email"
                  value={formData.billingEmail}
                  onChange={(e) => handleInputChange('billingEmail', e.target.value)}
                  placeholder="billing@acme.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Max Users</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={formData.maxUsers}
                  onChange={(e) => handleInputChange('maxUsers', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStores">Max Stores</Label>
                <Input
                  id="maxStores"
                  type="number"
                  value={formData.maxStores}
                  onChange={(e) => handleInputChange('maxStores', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxBlogCredits">Max Blog Credits</Label>
                <Input
                  id="maxBlogCredits"
                  type="number"
                  value={formData.maxBlogCredits}
                  onChange={(e) => handleInputChange('maxBlogCredits', parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* White-label Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>White-label Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Hide Our Branding</Label>
                  <p className="text-sm text-muted-foreground">Remove "Powered by" text</p>
                </div>
                <Switch
                  checked={formData.hideOurBranding}
                  onCheckedChange={(checked) => handleInputChange('hideOurBranding', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customSupportEmail">Custom Support Email</Label>
                <Input
                  id="customSupportEmail"
                  type="email"
                  value={formData.customSupportEmail}
                  onChange={(e) => handleInputChange('customSupportEmail', e.target.value)}
                  placeholder="support@acme.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/super-admin/agencies')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Agency'}
          </Button>
        </div>
      </form>
    </div>
  )
}

