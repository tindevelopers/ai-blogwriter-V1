
import { BaseLlmProvider } from './base-provider'
import { OpenAIProvider } from './providers/openai-provider'
import { AnthropicProvider } from './providers/anthropic-provider'
import { OpenRouterProvider } from './providers/openrouter-provider'
import { ProviderConfig } from './types'

export type SupportedProvider = 'openai' | 'anthropic' | 'openrouter'

export class ProviderFactory {
  private static instances: Map<string, BaseLlmProvider> = new Map()

  static createProvider(
    providerType: SupportedProvider,
    config: ProviderConfig,
    instanceId?: string
  ): BaseLlmProvider {
    const key = instanceId || `${providerType}-default`
    
    // Return existing instance if available (singleton pattern)
    if (this.instances.has(key)) {
      return this.instances.get(key)!
    }

    let provider: BaseLlmProvider

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
        throw new Error(`Unsupported provider type: ${providerType}`)
    }

    // Cache the instance
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
    return ['openai', 'anthropic', 'openrouter']
  }

  static async validateProviderConfig(
    providerType: SupportedProvider,
    config: ProviderConfig
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const provider = this.createProvider(providerType, config, `validation-${Date.now()}`)
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
}
