
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { BarChart3, TrendingUp, DollarSign, Zap, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UsageLog {
  id: string
  requestType: string
  inputTokens: number
  outputTokens: number
  totalCost: number
  latencyMs: number
  isSuccess: boolean
  createdAt: string
  provider: { displayName: string }
  model: { displayName: string }
}

interface UsageSummary {
  providerId: string
  providerName: string
  _sum: {
    inputTokens: number
    outputTokens: number
    totalCost: number
  }
  _count: number
}

interface Totals {
  totalRequests: number
  totalInputTokens: number
  totalOutputTokens: number
  totalCost: number
  successRate: number
}

export default function UsageAnalytics() {
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([])
  const [summary, setSummary] = useState<UsageSummary[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [timeframe, setTimeframe] = useState('30')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsageAnalytics()
  }, [timeframe])

  const fetchUsageAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/settings/usage-analytics?days=${timeframe}`)
      if (response.ok) {
        const data = await response.json()
        setUsageLogs(data.usageLogs)
        setSummary(data.summary)
        setTotals(data.totals)
      } else {
        throw new Error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Failed to fetch usage analytics:', error)
      toast.error('Failed to load usage analytics')
    } finally {
      setLoading(false)
    }
  }

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`
  const formatNumber = (num: number) => num.toLocaleString()
  const formatDate = (date: string) => new Date(date).toLocaleDateString()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Usage Analytics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <CardTitle>Usage Analytics</CardTitle>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        {totals && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Requests</span>
              </div>
              <p className="text-2xl font-bold mt-1">{formatNumber(totals.totalRequests)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Tokens</span>
              </div>
              <p className="text-2xl font-bold mt-1">
                {formatNumber(totals.totalInputTokens + totals.totalOutputTokens)}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Cost</span>
              </div>
              <p className="text-2xl font-bold mt-1">{formatCost(totals.totalCost)}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <p className="text-2xl font-bold mt-1">{totals.successRate.toFixed(1)}%</p>
            </div>
          </div>
        )}

        {/* Provider Breakdown */}
        <div>
          <h3 className="font-medium mb-3">Usage by Provider</h3>
          <div className="space-y-2">
            {summary.map(provider => (
              <div key={provider.providerId} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">{provider.providerName}</span>
                  <p className="text-sm text-gray-600">{provider._count} requests</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCost(provider._sum.totalCost || 0)}</p>
                  <p className="text-sm text-gray-600">
                    {formatNumber((provider._sum.inputTokens || 0) + (provider._sum.outputTokens || 0))} tokens
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Usage */}
        <div>
          <h3 className="font-medium mb-3">Recent Usage</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {usageLogs.slice(0, 20).map(log => (
              <div key={log.id} className="flex items-center justify-between p-2 text-sm border rounded">
                <div className="flex items-center space-x-2">
                  <Badge variant={log.isSuccess ? 'default' : 'destructive'} className="text-xs">
                    {log.isSuccess ? 'Success' : 'Failed'}
                  </Badge>
                  <span>{log.provider.displayName}</span>
                  <span className="text-gray-500">{log.model.displayName}</span>
                </div>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span>{formatNumber(log.inputTokens + log.outputTokens)} tokens</span>
                  <span>{formatCost(log.totalCost)}</span>
                  <span>{formatDate(log.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={fetchUsageAnalytics} variant="outline" className="w-full">
          Refresh Analytics
        </Button>
      </CardContent>
    </Card>
  )
}
