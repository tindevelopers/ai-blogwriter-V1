

"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { 
  Building, 
  Users, 
  Settings, 
  LogOut,
  Crown,
  BarChart3,
  Shield,
  Database
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SuperAdminNavProps {
  user: any
}

export function SuperAdminNav({ user }: SuperAdminNavProps) {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Overview',
      href: '/super-admin',
      icon: BarChart3,
    },
    {
      name: 'Agencies',
      href: '/super-admin/agencies',
      icon: Building,
    },
    {
      name: 'Users',
      href: '/super-admin/users',
      icon: Users,
    },
    {
      name: 'System',
      href: '/super-admin/system',
      icon: Database,
    },
    {
      name: 'Settings',
      href: '/super-admin/settings',
      icon: Settings,
    },
  ]

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/super-admin" className="flex items-center">
                <Crown className="h-8 w-8 text-yellow-500" />
                <span className="ml-2 text-xl font-bold text-white">Super Admin</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "border-yellow-500 text-white"
                        : "border-transparent text-slate-300 hover:border-slate-500 hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-slate-300">
                {user?.firstName} {user?.lastName}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

