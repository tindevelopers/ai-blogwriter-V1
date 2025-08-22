
import { LlmRouter } from './llm-router'
import { AISdkProvider, BlogStructureSchema } from './ai-sdk-provider'
import { EnhancedProviderFactory, SupportedProvider } from './enhanced-provider-factory'
import { LlmRequest, LlmResponse } from './types'
import { z } from 'zod'

export interface StreamingResponse {
  stream: AsyncGenerator<{ content: string; done: boolean }>
  metadata: {
    userId: string
    requestType: string
    providerId?: string
    modelId?: string
  }
}

export interface StructuredBlogResponse extends LlmResponse {
  structuredData: z.infer<typeof BlogStructureSchema>
}

export class EnhancedLlmService {
  private static routers: Map<string, LlmRouter> = new Map()

  static async getRouter(userId: string): Promise<LlmRouter> {
    const key = `router-${userId}`
    
    if (!this.routers.has(key)) {
      const router = new LlmRouter({ userId })
      await router.initialize()
      this.routers.set(key, router)
    }

    return this.routers.get(key)!
  }

  // Enhanced blog generation with structured output
  static async generateStructuredBlog(
    userId: string,
    prompt: string,
    options: {
      systemPrompt?: string
      maxTokens?: number
      temperature?: number
      topP?: number
      providerId?: string
      modelId?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<StructuredBlogResponse> {
    // Try to use AI SDK provider first for structured output
    const preferredProviderId = options.providerId || await this.getPreferredAISDKProvider(userId)
    
    if (preferredProviderId) {
      const provider = await this.getAISdkProviderInstance(userId, preferredProviderId, options.modelId)
      
      if (provider) {
        try {
          const request: LlmRequest = {
            prompt,
            systemPrompt: options.systemPrompt || this.getDefaultStructuredBlogSystemPrompt(),
            maxTokens: options.maxTokens || 3000,
            temperature: options.temperature || 0.7,
            topP: options.topP || 1.0,
            userId,
            requestType: 'structured_blog_generation',
            metadata: {
              model: options.modelId,
              providerId: preferredProviderId,
              ...options.metadata
            }
          }

          return await provider.generateStructuredBlog(request)
        } catch (error) {
          console.warn('Structured generation failed, falling back to regular generation:', error)
        }
      }
    }

    // Fallback to regular generation
    const router = await this.getRouter(userId)
    const response = await router.generateContent({
      prompt,
      systemPrompt: options.systemPrompt || this.getDefaultBlogSystemPrompt(),
      maxTokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      topP: options.topP || 1.0,
      userId,
      requestType: 'blog_generation',
      metadata: {
        model: options.modelId,
        ...options.metadata
      }
    })

    // Parse the response to create structured data (best effort)
    const structuredData = this.parseUnstructuredBlog(response.content)
    
    return {
      ...response,
      structuredData
    }
  }

  // Stream blog generation in real-time
  static async streamBlogGeneration(
    userId: string,
    prompt: string,
    options: {
      systemPrompt?: string
      maxTokens?: number
      temperature?: number
      topP?: number
      providerId?: string
      modelId?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<StreamingResponse> {
    const preferredProviderId = options.providerId || await this.getPreferredAISDKProvider(userId)
    
    if (!preferredProviderId) {
      throw new Error('No AI SDK provider available for streaming')
    }

    const provider = await this.getAISdkProviderInstance(userId, preferredProviderId, options.modelId)
    
    if (!provider) {
      throw new Error(`Failed to get AI SDK provider instance for ${preferredProviderId}`)
    }

    const request: LlmRequest = {
      prompt,
      systemPrompt: options.systemPrompt || this.getDefaultBlogSystemPrompt(),
      maxTokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      topP: options.topP || 1.0,
      userId,
      requestType: 'streaming_blog_generation',
      metadata: {
        model: options.modelId,
        providerId: preferredProviderId,
        ...options.metadata
      }
    }

    const stream = provider.streamContent(request)

    return {
      stream,
      metadata: {
        userId,
        requestType: 'streaming_blog_generation',
        providerId: preferredProviderId,
        modelId: options.modelId
      }
    }
  }

  // Original methods maintained for backward compatibility
  static async generateBlogContent(
    userId: string,
    prompt: string,
    options: {
      systemPrompt?: string
      maxTokens?: number
      temperature?: number
      topP?: number
      model?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<LlmResponse> {
    const router = await this.getRouter(userId)
    
    const request: LlmRequest = {
      prompt,
      systemPrompt: options.systemPrompt || this.getDefaultBlogSystemPrompt(),
      maxTokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.7,
      topP: options.topP || 1.0,
      userId,
      requestType: 'blog_generation',
      metadata: {
        model: options.model,
        ...options.metadata
      }
    }

    return await router.generateContent(request)
  }

  static async generateSeoOptimization(
    userId: string,
    prompt: string,
    options: {
      maxTokens?: number
      temperature?: number
      model?: string
      metadata?: Record<string, any>
    } = {}
  ): Promise<LlmResponse> {
    const router = await this.getRouter(userId)
    
    const request: LlmRequest = {
      prompt,
      systemPrompt: this.getDefaultSeoSystemPrompt(),
      maxTokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.3,
      userId,
      requestType: 'seo_optimization',
      metadata: {
        model: options.model,
        ...options.metadata
      }
    }

    return await router.generateContent(request)
  }

  static async getProviderStatus(userId: string) {
    const router = await this.getRouter(userId)
    return await router.getProviderStatus()
  }

  static async getProviderCapabilities(userId: string): Promise<Array<{
    providerId: string
    capabilities: {
      streaming: boolean
      structuredOutput: boolean
      vision: boolean
    }
  }>> {
    const providers = EnhancedProviderFactory.getSupportedProviders()
    const capabilities = []

    for (const providerId of providers) {
      const mode = EnhancedProviderFactory.getProviderMode(providerId)
      const isAISDK = mode === 'ai-sdk'
      
      capabilities.push({
        providerId,
        capabilities: {
          streaming: isAISDK,
          structuredOutput: isAISDK,
          vision: false // TODO: Implement vision detection
        }
      })
    }

    return capabilities
  }

  static clearRouterCache(userId?: string): void {
    if (userId) {
      const router = this.routers.get(`router-${userId}`)
      if (router) {
        router.dispose()
        this.routers.delete(`router-${userId}`)
      }
    } else {
      // Clear all routers
      for (const router of this.routers.values()) {
        router.dispose()
      }
      this.routers.clear()
    }
  }

  // Private helper methods
  private static async getPreferredAISDKProvider(userId: string): Promise<string | null> {
    // Get user's preferred AI SDK provider from database or return first available
    const aiSdkProviders = EnhancedProviderFactory.getAISDKProviders()
    
    if (aiSdkProviders.length === 0) {
      return null
    }

    // For now, return the first available AI SDK provider
    // TODO: Get from user preferences
    return aiSdkProviders[0]
  }

  private static async getAISdkProviderInstance(
    userId: string, 
    providerId: string, 
    modelId?: string
  ): Promise<AISdkProvider | null> {
    try {
      // Get provider config (you'll need to implement this based on your database)
      const config = await this.getProviderConfig(providerId)
      if (!config) return null

      const provider = EnhancedProviderFactory.createProvider(
        providerId as SupportedProvider,
        config,
        `${userId}-${providerId}`,
        modelId
      )

      return provider instanceof AISdkProvider ? provider : null
    } catch (error) {
      console.error(`Failed to get AI SDK provider ${providerId}:`, error)
      return null
    }
  }

  private static async getProviderConfig(providerId: string): Promise<any> {
    // TODO: Implement database lookup for provider config
    // For now, return environment-based config
    const envVarMap: Record<string, string> = {
      'openai': 'OPENAI_API_KEY',
      'anthropic': 'ANTHROPIC_API_KEY',
      'groq': 'GROQ_API_KEY',
      'mistral': 'MISTRAL_API_KEY',
      'cohere': 'COHERE_API_KEY'
    }

    const apiKey = process.env[envVarMap[providerId]]
    if (!apiKey) return null

    return {
      apiKey,
      maxRetries: 3,
      timeoutMs: 30000
    }
  }

  private static parseUnstructuredBlog(content: string): z.infer<typeof BlogStructureSchema> {
    // Basic parsing logic to extract structured data from unstructured content
    const lines = content.split('\n')
    const title = lines.find(line => line.startsWith('#'))?.replace('#', '').trim() || 'Untitled'
    
    const sections: Array<{ heading: string; content: string; keywords?: string[] }> = []
    let currentSection: { heading: string; content: string; keywords?: string[] } | null = null
    
    for (const line of lines) {
      if (line.startsWith('##')) {
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = {
          heading: line.replace('##', '').trim(),
          content: '',
          keywords: []
        }
      } else if (currentSection && line.trim()) {
        currentSection.content += line + '\n'
      }
    }
    
    if (currentSection) {
      sections.push(currentSection)
    }

    // Generate meta description from first section
    const firstSectionContent = sections[0]?.content || content.slice(0, 160)
    const metaDescription = firstSectionContent.slice(0, 160).trim()

    return {
      title,
      metaDescription,
      sections,
      tags: [],
      seoKeywords: []
    }
  }

  private static getDefaultBlogSystemPrompt(): string {
    return `You are an expert SEO blog writer specializing in e-commerce content. 

Your task is to create engaging, SEO-optimized blog posts that drive traffic and conversions for online stores.

Key requirements:
- Write in a conversational, engaging tone
- Include relevant keywords naturally throughout the content
- Structure content with clear headings and subheadings
- Focus on providing value to readers while subtly promoting products
- Include actionable tips and insights
- Ensure content is original and plagiarism-free
- Optimize for readability and SEO best practices

Format your response as a complete blog post with:
- Compelling headline (use # for main title)
- Engaging introduction
- Well-structured body with subheadings (use ## for sections)
- Clear conclusion with call-to-action
- Meta description suggestion`
  }

  private static getDefaultStructuredBlogSystemPrompt(): string {
    return `You are an expert SEO blog writer specializing in e-commerce content. 

Your task is to create engaging, SEO-optimized blog posts that drive traffic and conversions for online stores.

You will respond with a structured format that includes:
- A compelling, SEO-optimized title
- A meta description (max 160 characters)
- Well-organized sections with headings and content
- SEO keywords for optimization
- Relevant tags

Key requirements for each section:
- Write in a conversational, engaging tone
- Include relevant keywords naturally
- Provide actionable value to readers
- Focus on user intent and search behavior
- Ensure originality and expertise
- Optimize for featured snippets when possible

The content should be comprehensive, well-researched, and designed to rank well in search engines while providing genuine value to e-commerce store owners and their customers.`
  }

  private static getDefaultSeoSystemPrompt(): string {
    return `You are an SEO optimization expert. Analyze the provided content and provide specific recommendations for improvement.

Focus on:
- Keyword optimization and placement
- Meta title and description optimization
- Content structure and readability
- Internal linking opportunities
- Featured snippet optimization
- Technical SEO considerations

Provide actionable, specific recommendations with clear reasoning.`
  }
}

// Backward compatibility
export const LlmService = EnhancedLlmService
