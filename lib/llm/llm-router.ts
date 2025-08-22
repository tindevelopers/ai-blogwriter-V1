
import { BaseLlmProvider } from './base-provider'
import { EnhancedProviderFactory, SupportedProvider } from './enhanced-provider-factory'
import { LlmRequest, LlmResponse, LlmError, FallbackConfig, ProviderConfig } from './types'
import { prisma } from '@/lib/db'

export interface RouterConfig {
  userId: string
  fallbackConfig?: FallbackConfig
}

export class LlmRouter {
  private providers: Map<string, BaseLlmProvider> = new Map()
  private fallbackConfig: FallbackConfig

  constructor(private config: RouterConfig) {
    this.fallbackConfig = config.fallbackConfig || {
      enableFallback: true,
      maxRetries: 3,
      providers: []
    }
  }

  async initialize(): Promise<void> {
    // Load user's provider preferences and fallback configuration
    const userPreferences = await this.getUserPreferences()
    
    // Initialize providers based on user preferences and available configurations
    await this.initializeProviders(userPreferences)
  }

  async generateContent(request: LlmRequest): Promise<LlmResponse> {
    const startTime = Date.now()
    let lastError: LlmError | null = null
    
    // Get provider priority list
    const providerPriority = await this.getProviderPriority()
    
    for (const providerId of providerPriority) {
      const provider = this.providers.get(providerId)
      if (!provider) continue

      try {
        console.log(`Attempting generation with provider: ${providerId}`)
        
        // Check if provider is healthy before using
        const health = await provider.healthCheck()
        if (!health.healthy) {
          console.warn(`Provider ${providerId} is unhealthy: ${health.error}`)
          continue
        }

        // Attempt content generation
        const response = await provider.generateContent(request)
        
        // Log successful usage
        await this.logUsage({
          userId: request.userId,
          providerId,
          modelId: response.model,
          requestType: request.requestType,
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          totalCost: response.cost,
          latencyMs: response.latencyMs,
          isSuccess: true,
          metadata: request.metadata
        })

        return response
        
      } catch (error: any) {
        lastError = error as LlmError
        console.error(`Provider ${providerId} failed:`, error.message)
        
        // Log failed usage
        await this.logUsage({
          userId: request.userId,
          providerId,
          modelId: request.metadata?.model || 'unknown',
          requestType: request.requestType,
          inputTokens: 0,
          outputTokens: 0,
          totalCost: 0,
          latencyMs: Date.now() - startTime,
          isSuccess: false,
          errorMessage: error.message,
          metadata: request.metadata
        })

        // If this is not a retryable error or we don't have fallback enabled, break
        if (!this.fallbackConfig.enableFallback || !error.retryable) {
          break
        }

        // Continue to next provider for retryable errors
        continue
      }
    }

    // All providers failed
    throw lastError || new Error('All LLM providers failed')
  }

  async getProviderStatus(): Promise<Array<{ providerId: string; healthy: boolean; latency?: number; error?: string }>> {
    const statuses = []
    
    for (const [providerId, provider] of this.providers.entries()) {
      const health = await provider.healthCheck()
      statuses.push({
        providerId,
        ...health
      })
    }
    
    return statuses
  }

  private async getUserPreferences() {
    return await prisma.agencyLlmPreference.findFirst({
      where: { userId: this.config.userId },
      include: {
        provider: true,
        model: true
      }
    })
  }

  private async getProviderPriority(): Promise<string[]> {
    const userPrefs = await this.getUserPreferences()
    
    if (userPrefs && userPrefs.provider) {
      const priority = [userPrefs.providerId!]
      
      // Add fallback providers
      if (userPrefs.fallbackProviderId1) {
        priority.push(userPrefs.fallbackProviderId1)
      }
      if (userPrefs.fallbackProviderId2) {
        priority.push(userPrefs.fallbackProviderId2)
      }
      
      return priority.filter(Boolean)
    }

    // Default fallback to all available providers
    return Array.from(this.providers.keys())
  }

  private async initializeProviders(userPreferences: any) {
    // Get all enabled providers from database
    const enabledProviders = await prisma.llmProvider.findMany({
      where: { isEnabled: true },
      orderBy: { priority: 'asc' }
    })

    for (const dbProvider of enabledProviders) {
      try {
        // Get API key from environment variable
        const apiKey = dbProvider.apiKeyEnvVar ? process.env[dbProvider.apiKeyEnvVar] : undefined
        
        if (!apiKey) {
          console.warn(`No API key found for provider ${dbProvider.name}`)
          continue
        }

        const config: ProviderConfig = {
          apiKey,
          baseUrl: dbProvider.baseUrl || undefined,
          maxRetries: dbProvider.maxRetries,
          timeoutMs: dbProvider.timeoutMs
        }

        const provider = EnhancedProviderFactory.createProvider(
          dbProvider.name as SupportedProvider,
          config,
          `${dbProvider.id}-${this.config.userId}`
        )

        this.providers.set(dbProvider.id, provider)
        console.log(`Initialized provider: ${dbProvider.name}`)
        
      } catch (error) {
        console.error(`Failed to initialize provider ${dbProvider.name}:`, error)
      }
    }
  }

  private async logUsage(data: {
    userId: string
    providerId: string
    modelId: string
    requestType: string
    inputTokens: number
    outputTokens: number
    totalCost: number
    latencyMs: number
    isSuccess: boolean
    errorMessage?: string
    metadata?: any
  }) {
    try {
      await prisma.llmUsageLog.create({
        data: {
          userId: data.userId,
          providerId: data.providerId,
          modelId: data.modelId,
          requestType: data.requestType,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          totalCost: data.totalCost,
          latencyMs: data.latencyMs,
          isSuccess: data.isSuccess,
          errorMessage: data.errorMessage,
          metadata: data.metadata || {}
        }
      })
    } catch (error) {
      console.error('Failed to log LLM usage:', error)
    }
  }

  // Clean up resources
  dispose(): void {
    this.providers.clear()
  }
}
