
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Brain, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface LlmModel {
  id: string
  name: string
  displayName: string
  quality: 'BASIC' | 'PRO' | 'ENTERPRISE'
  inputCostPer1K: number
  outputCostPer1K: number
  isEnabled: boolean
}

interface LlmProvider {
  id: string
  name: string
  displayName: string
  isEnabled: boolean
  priority: number
  models: LlmModel[]
}

interface UserPreference {
  id?: string
  providerId?: string
  modelId?: string
  maxQuality: 'BASIC' | 'PRO' | 'ENTERPRISE'
  enableFallback: boolean
  maxCostPer1K?: number
}

export default function LlmProviderSettings() {
  const [providers, setProviders] = useState<LlmProvider[]>([])
  const [userPreference, setUserPreference] = useState<UserPreference>({
    maxQuality: 'PRO',
    enableFallback: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/settings/llm-providers')
      if (response.ok) {
        const data = await response.json()
        setProviders(data.providers)
        if (data.userPreference) {
          setUserPreference(data.userPreference)
        }
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
      toast.error('Failed to load LLM providers')
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/settings/llm-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPreference)
      })

      if (response.ok) {
        toast.success('LLM preferences saved successfully')
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const getQualityBadge = (quality: string) => {
    const colors = {
      BASIC: 'bg-gray-100 text-gray-800',
      PRO: 'bg-blue-100 text-blue-800',
      ENTERPRISE: 'bg-purple-100 text-purple-800'
    }
    return <Badge className={colors[quality as keyof typeof colors]}>{quality}</Badge>
  }

  const selectedProvider = providers.find(p => p.id === userPreference.providerId)
  const availableModels = selectedProvider?.models.filter(m => 
    m.isEnabled && 
    ['BASIC', 'PRO', 'ENTERPRISE'].indexOf(m.quality) <= ['BASIC', 'PRO', 'ENTERPRISE'].indexOf(userPreference.maxQuality)
  ) || []

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <CardTitle>LLM Provider Settings</CardTitle>
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
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <CardTitle>LLM Provider Settings</CardTitle>
        </div>
        <p className="text-sm text-gray-600">Configure your preferred AI models and providers</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Status */}
        <div>
          <Label className="text-base font-medium">Available Providers</Label>
          <div className="mt-2 space-y-3">
            {providers.map(provider => (
              <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{provider.displayName}</span>
                    {provider.isEnabled ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{provider.models.length} models available</p>
                </div>
                <Badge variant={provider.isEnabled ? 'default' : 'secondary'}>
                  {provider.isEnabled ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Provider Selection */}
        <div>
          <Label htmlFor="primaryProvider">Primary Provider</Label>
          <Select
            value={userPreference.providerId || ""}
            onValueChange={(value) => setUserPreference(prev => ({ 
              ...prev, 
              providerId: value,
              modelId: undefined // Reset model when provider changes
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select primary provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.filter(p => p.isEnabled).map(provider => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Model Selection */}
        {selectedProvider && (
          <div>
            <Label htmlFor="model">Preferred Model</Label>
            <Select
              value={userPreference.modelId || ""}
              onValueChange={(value) => setUserPreference(prev => ({ ...prev, modelId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preferred model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center space-x-2">
                      <span>{model.displayName}</span>
                      {getQualityBadge(model.quality)}
                      <span className="text-xs text-gray-500">
                        ${model.inputCostPer1K.toFixed(4)}/1K in
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Quality Limit */}
        <div>
          <Label htmlFor="maxQuality">Maximum Quality Level</Label>
          <Select
            value={userPreference.maxQuality}
            onValueChange={(value: 'BASIC' | 'PRO' | 'ENTERPRISE') => 
              setUserPreference(prev => ({ ...prev, maxQuality: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BASIC">Basic (Fastest, Cheapest)</SelectItem>
              <SelectItem value="PRO">Pro (Balanced)</SelectItem>
              <SelectItem value="ENTERPRISE">Enterprise (Highest Quality)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cost Limit */}
        <div>
          <Label htmlFor="maxCost">Maximum Cost per 1K Tokens ($)</Label>
          <Input
            id="maxCost"
            type="number"
            step="0.001"
            placeholder="0.010"
            value={userPreference.maxCostPer1K || ''}
            onChange={(e) => setUserPreference(prev => ({ 
              ...prev, 
              maxCostPer1K: parseFloat(e.target.value) || undefined 
            }))}
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for no limit</p>
        </div>

        {/* Fallback Settings */}
        <div className="flex items-center space-x-2">
          <Switch
            id="enableFallback"
            checked={userPreference.enableFallback}
            onCheckedChange={(checked) => 
              setUserPreference(prev => ({ ...prev, enableFallback: checked }))
            }
          />
          <Label htmlFor="enableFallback">Enable automatic fallback to other providers</Label>
        </div>

        <Button onClick={savePreferences} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save LLM Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
