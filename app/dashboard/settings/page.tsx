

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, User, CreditCard, Key, Shield } from 'lucide-react'
import LlmProviderSettings from '@/components/settings/llm-provider-settings'
import UsageAnalytics from '@/components/settings/usage-analytics'
import ContentPreferences from '@/components/settings/content-preferences'

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
  }

  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        agency: true
      }
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id }
    })
  ])

  const isAgencyAdmin = user?.role === 'AGENCY_ADMIN'
  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and integrations</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={user?.firstName || ''}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={user?.lastName || ''}
                  disabled
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ''}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                defaultValue={user?.companyName || ''}
                disabled
              />
            </div>
            {user?.agency && (
              <div>
                <Label htmlFor="agency">Agency</Label>
                <Input
                  id="agency"
                  defaultValue={user.agency.name}
                  disabled
                />
              </div>
            )}
            <Button disabled>
              Save Changes (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle>Subscription & Billing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium capitalize">{subscription?.plan || 'Free'} Plan</p>
                  <p className="text-sm text-gray-600">
                    {subscription?.usedCredits || 0} / {subscription?.blogCredits || 0} blog credits used
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    subscription?.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {subscription?.status || 'Active'}
                  </span>
                </div>
              </div>
              <Button disabled>
                Upgrade Plan (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* LLM Provider Settings */}
        <LlmProviderSettings />

        {/* Content Generation Preferences */}
        <ContentPreferences />

        {/* Usage Analytics */}
        <UsageAnalytics />

        {/* API Integrations */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5" />
              <CardTitle>API Integrations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">DataForSEO API</h4>
                    <p className="text-sm text-gray-600">Keyword research and SEO analytics</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                    Demo Mode
                  </span>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Shopify API</h4>
                    <p className="text-sm text-gray-600">Blog and article publishing</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">OpenAI API</h4>
                    <p className="text-sm text-gray-600">GPT models for content generation</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">OpenRouter API</h4>
                    <p className="text-sm text-gray-600">Access to multiple LLM providers</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
              </div>
            </div>
            <Button disabled>
              Manage API Keys (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  disabled
                />
              </div>
              <Button disabled>
                Update Password (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Account Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Account Type:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  isSuperAdmin ? 'bg-red-100 text-red-800' :
                  isAgencyAdmin ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user?.role?.replace('_', ' ') || 'User'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since:</span>
                <span>{new Date(user?.createdAt || '').toLocaleDateString()}</span>
              </div>
              {user?.agency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Agency:</span>
                  <span>{user.agency.name}</span>
                </div>
              )}
            </div>
            {isSuperAdmin && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Super Admin Access:</strong> You have full system access and can manage all agencies and users.
                </p>
              </div>
            )}
            {isAgencyAdmin && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Agency Admin:</strong> You can manage your agency's settings and users.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

