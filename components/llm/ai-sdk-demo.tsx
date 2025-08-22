
'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Zap, Brain, Cpu, Play, Square } from 'lucide-react'

interface ProviderCapabilities {
  providerId: string
  capabilities: {
    streaming: boolean
    structuredOutput: boolean
    vision: boolean
  }
}

interface StreamChunk {
  content: string
  done: boolean
  metadata?: any
}

export default function AISdkDemo() {
  const [prompt, setPrompt] = useState('Write a comprehensive guide about starting an e-commerce business')
  const [selectedProvider, setSelectedProvider] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [streamingContent, setStreamingContent] = useState('')
  const [capabilities, setCapabilities] = useState<ProviderCapabilities[]>([])
  const [supportedProviders, setSupportedProviders] = useState<string[]>([])

  React.useEffect(() => {
    fetchCapabilities()
  }, [])

  const fetchCapabilities = async () => {
    try {
      const response = await fetch('/api/llm/provider-capabilities')
      const data = await response.json()
      
      if (data.success) {
        setCapabilities(data.data.capabilities)
        setSupportedProviders(data.data.supportedProviders)
        if (data.data.supportedProviders.length > 0) {
          setSelectedProvider(data.data.supportedProviders[0])
        }
      }
    } catch (error) {
      console.error('Error fetching capabilities:', error)
    }
  }

  const generateStructuredBlog = async () => {
    setIsLoading(true)
    setResponse(null)
    
    try {
      const response = await fetch('/api/llm/generate-structured-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          providerId: selectedProvider || undefined,
          modelId: selectedModel || undefined,
          useStructured: true,
          maxTokens: 3000,
          temperature: 0.7
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResponse(data.data)
      } else {
        console.error('Error:', data.error)
      }
    } catch (error) {
      console.error('Error generating blog:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const streamBlog = async () => {
    setIsStreaming(true)
    setStreamingContent('')
    
    try {
      const response = await fetch('/api/llm/stream-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          providerId: selectedProvider || undefined,
          modelId: selectedModel || undefined,
          maxTokens: 2000,
          temperature: 0.7
        })
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: StreamChunk = JSON.parse(line.slice(6))
              
              if (data.content) {
                setStreamingContent(prev => prev + data.content)
              }
              
              if (data.done) {
                setIsStreaming(false)
                return
              }
            } catch (error) {
              console.error('Error parsing stream data:', error)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming blog:', error)
    } finally {
      setIsStreaming(false)
    }
  }

  const stopStreaming = () => {
    setIsStreaming(false)
  }

  const getProviderCapabilities = (providerId: string) => {
    return capabilities.find(c => c.providerId === providerId)?.capabilities
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI SDK v5 Demo - Enhanced LLM Features
          </CardTitle>
          <CardDescription>
            Test the new Vercel AI SDK integration with structured output, streaming, and multiple providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Provider Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Provider</label>
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {supportedProviders.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      <div className="flex items-center gap-2">
                        {provider}
                        {getProviderCapabilities(provider)?.streaming && (
                          <Badge variant="secondary" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Stream
                          </Badge>
                        )}
                        {getProviderCapabilities(provider)?.structuredOutput && (
                          <Badge variant="secondary" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            Struct
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Model (Optional)</label>
              <Input
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder="Leave empty for default model"
              />
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Blog Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your blog topic or detailed prompt..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={generateStructuredBlog} 
              disabled={isLoading || !prompt.trim()}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Generate Structured Blog
            </Button>
            
            <Button 
              onClick={isStreaming ? stopStreaming : streamBlog} 
              disabled={isLoading || !prompt.trim()}
              variant={isStreaming ? "destructive" : "outline"}
              className="flex-1"
            >
              {isStreaming ? (
                <Square className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isStreaming ? 'Stop Stream' : 'Stream Blog'}
            </Button>
          </div>

          {/* Results */}
          <Tabs defaultValue="structured" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="structured">Structured Output</TabsTrigger>
              <TabsTrigger value="streaming">Live Stream</TabsTrigger>
            </TabsList>
            
            <TabsContent value="structured" className="space-y-4">
              {response && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Blog</CardTitle>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">
                        <Cpu className="h-3 w-3 mr-1" />
                        {response.provider}
                      </Badge>
                      <Badge variant="outline">
                        {response.model}
                      </Badge>
                      <Badge variant="outline">
                        {response.inputTokens + response.outputTokens} tokens
                      </Badge>
                      <Badge variant="outline">
                        ${response.cost.toFixed(4)}
                      </Badge>
                      <Badge variant="outline">
                        {response.latencyMs}ms
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {response.structuredData ? (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg">{response.structuredData.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {response.structuredData.metaDescription}
                          </p>
                        </div>
                        
                        {response.structuredData.sections.map((section: any, index: number) => (
                          <div key={index} className="border-l-4 border-primary/20 pl-4">
                            <h4 className="font-medium text-base mb-2">{section.heading}</h4>
                            <div className="prose prose-sm max-w-none">
                              {section.content.split('\n').map((paragraph: string, pIndex: number) => (
                                paragraph.trim() && <p key={pIndex}>{paragraph}</p>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        {response.structuredData.seoKeywords?.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">SEO Keywords</h4>
                            <div className="flex flex-wrap gap-2">
                              {response.structuredData.seoKeywords.map((keyword: string, index: number) => (
                                <Badge key={index} variant="secondary">{keyword}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: response.content.replace(/\n/g, '<br/>') }} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="streaming" className="space-y-4">
              {(streamingContent || isStreaming) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Live Stream Output
                      {isStreaming && <Loader2 className="h-4 w-4 animate-spin" />}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none bg-muted/30 rounded-lg p-4 min-h-[200px]">
                      <div className="whitespace-pre-wrap">
                        {streamingContent}
                        {isStreaming && <span className="animate-pulse">|</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Provider Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle>Provider Capabilities</CardTitle>
          <CardDescription>Available providers and their features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map(provider => (
              <Card key={provider.providerId} className="border-2 border-dashed">
                <CardContent className="p-4">
                  <h4 className="font-medium capitalize mb-2">{provider.providerId}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm">Streaming:</span>
                      <Badge variant={provider.capabilities.streaming ? "default" : "secondary"}>
                        {provider.capabilities.streaming ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      <span className="text-sm">Structured Output:</span>
                      <Badge variant={provider.capabilities.structuredOutput ? "default" : "secondary"}>
                        {provider.capabilities.structuredOutput ? "Yes" : "No"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
