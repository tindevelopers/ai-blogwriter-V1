
import { BaseLlmProvider } from './base-provider'
import { OpenAIProvider } from './providers/openai-provider'
import { AnthropicProvider } from './providers/anthropic-provider'
import { OpenRouterProvider } from './providers/openrouter-provider'
import { AISdkProvider, AISDKProvider } from './ai-sdk-provider'
import { ProviderConfig } from './types'

export type SupportedProvider = 'openai' | 'anthropic' | 'openrouter' | 'groq' | 'mistral' | 'cohere'
export type ProviderMode = 'legacy' | 'ai-sdk'

interface ProviderDefinition {
  type: SupportedProvider
  mode: ProviderMode
  defaultModel?: string
  aiSdkType?: AISDKProvider
}

export class EnhancedProviderFactory {
  private static instances: Map<string, BaseLlmProvider> = new Map()
  
  // Define which providers use which implementation
  private static providerDefinitions: Record<SupportedProvider, ProviderDefinition> = {
    'openai': { type: 'openai', mode: 'ai-sdk', aiSdkType: 'openai', defaultModel: 'gpt-4o-mini' },
    'anthropic': { type: 'anthropic', mode: 'ai-sdk', aiSdkType: 'anthropic', defaultModel: 'claude-3-5-sonnet-20241022' },
    'openrouter': { type: 'openrouter', mode: 'legacy' }, // Keep legacy until AI SDK supports it
    'groq': { type: 'groq', mode: 'ai-sdk', aiSdkType: 'groq', defaultModel: 'llama-3.1-70b-versatile' },
    'mistral': { type: 'mistral', mode: 'ai-sdk', aiSdkType: 'mistral', defaultModel: 'mistral-large-latest' },
    'cohere': { type: 'cohere', mode: 'ai-sdk', aiSdkType: 'cohere', defaultModel: 'command-r-plus' }
  }

  static createProvider(
    providerType: SupportedProvider,
    config: ProviderConfig,
    instanceId?: string,
    modelId?: string
  ): BaseLlmProvider {
    const key = instanceId || `${providerType}-default`
    
    // Return existing instance if available (singleton pattern)
    if (this.instances.has(key)) {
      return this.instances.get(key)!
    }

    const definition = this.providerDefinitions[providerType]
    if (!definition) {
      throw new Error(`Unsupported provider type: ${providerType}`)
    }

    let provider: BaseLlmProvider

    if (definition.mode === 'ai-sdk') {
      if (!definition.aiSdkType) {
        throw new Error(`AI SDK type not defined for provider: ${providerType}`)
      }
      
      const model = modelId || definition.defaultModel || 'default'
      provider = new AISdkProvider(config, definition.aiSdkType, model)
    } else {
      // Legacy provider implementation
      switch (providerType) {
        case 'openai':
          provider = new OpenAIProvider(config)
          break
        case 'anthropic':
          provider = new AnthropicProvider(config)
          break
        case 'openrouter':
          provider = new OpenRouterProvider(config)
          break
        default:
          throw new Error(`Legacy provider not implemented: ${providerType}`)
      }
    }

    // Cache the instance
    this.instances.set(key, provider)
    return provider
  }

  static createAISDKProvider(
    aiSdkType: AISDKProvider,
    config: ProviderConfig,
    modelId: string,
    instanceId?: string
  ): AISdkProvider {
    const key = instanceId || `${aiSdkType}-${modelId}-default`
    
    if (this.instances.has(key)) {
      const existing = this.instances.get(key)!
      if (existing instanceof AISdkProvider) {
        return existing
      }
    }

    const provider = new AISdkProvider(config, aiSdkType, modelId)
    this.instances.set(key, provider)
    return provider
  }

  static clearInstanceCache(instanceId?: string): void {
    if (instanceId) {
      this.instances.delete(instanceId)
    } else {
      this.instances.clear()
    }
  }

  static getSupportedProviders(): SupportedProvider[] {
    return Object.keys(this.providerDefinitions) as SupportedProvider[]
  }

  static getAISDKProviders(): AISDKProvider[] {
    return Object.entries(this.providerDefinitions)
      .filter(([_, def]) => def.mode === 'ai-sdk' && def.aiSdkType)
      .map(([_, def]) => def.aiSdkType!) as AISDKProvider[]
  }

  static getProviderMode(providerType: SupportedProvider): ProviderMode {
    return this.providerDefinitions[providerType]?.mode || 'legacy'
  }

  static getDefaultModel(providerType: SupportedProvider): string | undefined {
    return this.providerDefinitions[providerType]?.defaultModel
  }

  static async validateProviderConfig(
    providerType: SupportedProvider,
    config: ProviderConfig,
    modelId?: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const provider = this.createProvider(providerType, config, `validation-${Date.now()}`, modelId)
      const isValid = await provider.validateApiKey()
      
      // Clean up validation instance
      this.clearInstanceCache(`validation-${Date.now()}`)
      
      return {
        valid: isValid,
        error: isValid ? undefined : 'API key validation failed'
      }
    } catch (error: any) {
      return {
        valid: false,
        error: error.message
      }
    }
  }

  static async getProviderModels(
    providerType: SupportedProvider,
    config: ProviderConfig
  ): Promise<any[]> {
    try {
      const provider = this.createProvider(providerType, config, `models-${Date.now()}`)
      const models = await provider.getAvailableModels()
      
      // Clean up instance
      this.clearInstanceCache(`models-${Date.now()}`)
      
      return models
    } catch (error) {
      return []
    }
  }

  // New methods for AI SDK specific functionality
  static async testStreamingCapability(
    providerType: SupportedProvider,
    config: ProviderConfig,
    modelId?: string
  ): Promise<boolean> {
    const definition = this.providerDefinitions[providerType]
    if (definition?.mode !== 'ai-sdk') {
      return false
    }

    try {
      const provider = this.createProvider(providerType, config, `stream-test-${Date.now()}`, modelId)
      if (provider instanceof AISdkProvider) {
        // Test streaming with a simple prompt
        const stream = provider.streamContent({
          prompt: 'Hello',
          userId: 'test',
          requestType: 'test',
          maxTokens: 10
        })
        
        // Just check if we can start streaming
        const { value } = await stream.next()
        return value !== undefined
      }
      return false
    } catch (error) {
      return false
    } finally {
      this.clearInstanceCache(`stream-test-${Date.now()}`)
    }
  }

  static async testStructuredGeneration(
    providerType: SupportedProvider,
    config: ProviderConfig,
    modelId?: string
  ): Promise<boolean> {
    const definition = this.providerDefinitions[providerType]
    if (definition?.mode !== 'ai-sdk') {
      return false
    }

    try {
      const provider = this.createProvider(providerType, config, `struct-test-${Date.now()}`, modelId)
      if (provider instanceof AISdkProvider) {
        // Test structured generation with a simple blog request
        await provider.generateStructuredBlog({
          prompt: 'Write a short blog about AI',
          userId: 'test',
          requestType: 'test',
          maxTokens: 500
        })
        return true
      }
      return false
    } catch (error) {
      return false
    } finally {
      this.clearInstanceCache(`struct-test-${Date.now()}`)
    }
  }
}

// Backward compatibility exports  
export const ProviderFactory = EnhancedProviderFactory
