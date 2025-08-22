
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { FileText, Palette, Target } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface ContentPreferences {
  defaultTone: string
  defaultStyle: string
  defaultLength: string
  includeImages: boolean
  autoPublish: boolean
  seoOptimization: boolean
  customInstructions: string
  targetAudience: string
  primaryLanguage: string
  includeMetadata: boolean
}

export default function ContentPreferences() {
  const [preferences, setPreferences] = useState<ContentPreferences>({
    defaultTone: 'professional',
    defaultStyle: 'informative',
    defaultLength: 'medium',
    includeImages: true,
    autoPublish: false,
    seoOptimization: true,
    customInstructions: '',
    targetAudience: 'general',
    primaryLanguage: 'en',
    includeMetadata: true
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, you'd fetch user's preferences from an API
    setLoading(false)
  }, [])

  const savePreferences = async () => {
    setSaving(true)
    try {
      // In a real implementation, you'd save to an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)) // Mock API call
      toast.success('Content preferences saved successfully')
    } catch (error) {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const updatePreference = (key: keyof ContentPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Content Preferences</CardTitle>
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
          <FileText className="h-5 w-5" />
          <CardTitle>Content Generation Preferences</CardTitle>
        </div>
        <p className="text-sm text-gray-600">Configure default settings for blog content generation</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Writing Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tone">Default Tone</Label>
            <Select value={preferences.defaultTone} onValueChange={(value) => updatePreference('defaultTone', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="style">Writing Style</Label>
            <Select value={preferences.defaultStyle} onValueChange={(value) => updatePreference('defaultStyle', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="informative">Informative</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
                <SelectItem value="narrative">Narrative</SelectItem>
                <SelectItem value="analytical">Analytical</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="listicle">List-based</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="length">Default Length</Label>
            <Select value={preferences.defaultLength} onValueChange={(value) => updatePreference('defaultLength', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (500-800 words)</SelectItem>
                <SelectItem value="medium">Medium (800-1500 words)</SelectItem>
                <SelectItem value="long">Long (1500-2500 words)</SelectItem>
                <SelectItem value="comprehensive">Comprehensive (2500+ words)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <Select value={preferences.targetAudience} onValueChange={(value) => updatePreference('targetAudience', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Public</SelectItem>
                <SelectItem value="beginners">Beginners</SelectItem>
                <SelectItem value="professionals">Professionals</SelectItem>
                <SelectItem value="experts">Industry Experts</SelectItem>
                <SelectItem value="customers">Potential Customers</SelectItem>
                <SelectItem value="existing">Existing Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="language">Primary Language</Label>
          <Select value={preferences.primaryLanguage} onValueChange={(value) => updatePreference('primaryLanguage', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Features */}
        <div className="space-y-4">
          <h3 className="font-medium flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Content Features</span>
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="seoOptimization">SEO Optimization</Label>
                <p className="text-sm text-gray-600">Include meta descriptions, keywords, and SEO best practices</p>
              </div>
              <Switch
                id="seoOptimization"
                checked={preferences.seoOptimization}
                onCheckedChange={(checked) => updatePreference('seoOptimization', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includeImages">Auto-generate Images</Label>
                <p className="text-sm text-gray-600">Automatically include relevant images in blog posts</p>
              </div>
              <Switch
                id="includeImages"
                checked={preferences.includeImages}
                onCheckedChange={(checked) => updatePreference('includeImages', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="includeMetadata">Include Metadata</Label>
                <p className="text-sm text-gray-600">Add structured data and meta information</p>
              </div>
              <Switch
                id="includeMetadata"
                checked={preferences.includeMetadata}
                onCheckedChange={(checked) => updatePreference('includeMetadata', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoPublish">Auto-publish</Label>
                <p className="text-sm text-gray-600">Automatically publish approved content to Shopify</p>
              </div>
              <Switch
                id="autoPublish"
                checked={preferences.autoPublish}
                onCheckedChange={(checked) => updatePreference('autoPublish', checked)}
              />
            </div>
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <Label htmlFor="customInstructions">Custom Instructions</Label>
          <Textarea
            id="customInstructions"
            placeholder="Add any specific instructions or guidelines for content generation..."
            value={preferences.customInstructions}
            onChange={(e) => updatePreference('customInstructions', e.target.value)}
            rows={4}
          />
        </div>

        <Button onClick={savePreferences} disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save Content Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
