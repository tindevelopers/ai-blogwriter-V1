
import { LlmRouter } from './llm-router'
import { LlmRequest, LlmResponse } from './types'

export class LlmService {
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
- Compelling headline
- Engaging introduction
- Well-structured body with subheadings
- Clear conclusion with call-to-action
- Meta description suggestion`
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
