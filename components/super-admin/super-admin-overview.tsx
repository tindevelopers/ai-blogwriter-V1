

"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Building, 
  Users, 
  ShoppingBag, 
  TrendingUp,
  PlusCircle,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuperAdminOverviewProps {
  stats: {
    totalAgencies: number
    activeAgencies: number
    totalUsers: number
    totalStores: number
    totalRevenue: number
    monthlyGrowth: number
  }
  recentAgencies: any[]
  systemHealth: any
}

export function SuperAdminOverview({
  stats,
  recentAgencies,
  systemHealth
}: SuperAdminOverviewProps) {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg px-6 py-8 text-white">
        <h1 className="text-3xl font-bold">
          Super Admin Dashboard
        </h1>
        <p className="text-slate-300 mt-2">
          Manage your agencies and oversee the entire platform ecosystem
        </p>
        <div className="mt-4 flex space-x-4">
          <Button asChild variant="secondary">
            <Link href="/super-admin/agencies/new">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Agency
            </Link>
          </Button>
          <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">
            <Link href="/super-admin/system">
              System Health
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAgencies}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAgencies} active
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Across all agencies
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
              Platform-wide stores
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agencies */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Agencies</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/super-admin/agencies">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentAgencies?.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No agencies created yet</p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/super-admin/agencies/new">Create First Agency</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentAgencies?.slice(0, 3)?.map((agency) => (
                  <div key={agency?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        agency?.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      )}>
                        <Building className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{agency?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {agency?.users?.length || 0} users • {agency?.subscriptionPlan}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/super-admin/agencies/${agency?.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Healthy</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">LLM Services</span>
                </div>
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Online</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">API Rate Limit</span>
                </div>
                <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">85% Used</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

