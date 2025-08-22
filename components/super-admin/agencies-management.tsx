

"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { 
  Building, 
  Users, 
  MoreHorizontal, 
  Plus, 
  Search,
  Eye,
  Edit,
  Pause,
  Play,
  Trash2,
  DollarSign
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgenciesManagementProps {
  agencies: any[]
}

export function AgenciesManagement({ agencies }: AgenciesManagementProps) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredAgencies = agencies?.filter(agency =>
    agency?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency?.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agency?.owner?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) return <Badge variant="secondary">Suspended</Badge>
    
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'starter':
        return <Badge variant="outline">Starter</Badge>
      case 'pro':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pro</Badge>
      case 'enterprise':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Enterprise</Badge>
      default:
        return <Badge variant="secondary">{plan}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Agency Management</h2>
          <p className="text-muted-foreground">
            Manage all agencies and their configurations
          </p>
        </div>
        <Button asChild>
          <Link href="/super-admin/agencies/new">
            <Plus className="h-4 w-4 mr-2" />
            New Agency
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencies?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {agencies?.filter(a => a?.isActive && a?.subscriptionStatus === 'active')?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <Pause className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {agencies?.filter(a => !a?.isActive || a?.subscriptionStatus === 'suspended')?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(agencies?.reduce((acc, agency) => {
                const planRevenue = agency?.subscriptionPlan === 'enterprise' ? 299 : 
                                  agency?.subscriptionPlan === 'pro' ? 99 : 29
                return acc + (agency?.subscriptionStatus === 'active' ? planRevenue : 0)
              }, 0) || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search agencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Agencies Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Agencies ({filteredAgencies?.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAgencies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-muted-foreground">No agencies found</p>
                    <Button asChild variant="outline" size="sm" className="mt-2">
                      <Link href="/super-admin/agencies/new">Create First Agency</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgencies?.map((agency) => (
                  <TableRow key={agency?.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          agency?.isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                        )}>
                          <Building className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{agency?.name}</div>
                          <div className="text-sm text-muted-foreground">{agency?.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {agency?.owner?.firstName} {agency?.owner?.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{agency?.owner?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPlanBadge(agency?.subscriptionPlan)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(agency?.subscriptionStatus, agency?.isActive)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{agency?.users?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(agency?.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/super-admin/agencies/${agency?.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/super-admin/agencies/${agency?.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Agency
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-orange-600">
                            <Pause className="h-4 w-4 mr-2" />
                            {agency?.isActive ? 'Suspend' : 'Activate'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Agency
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

