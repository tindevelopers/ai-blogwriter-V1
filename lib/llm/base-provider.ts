
import { LlmRequest, LlmResponse, LlmError, ProviderConfig, ModelInfo } from './types'

export abstract class BaseLlmProvider {
  protected config: ProviderConfig
  protected providerName: string

  constructor(config: ProviderConfig, providerName: string) {
    this.config = config
    this.providerName = providerName
  }

  // Abstract methods that each provider must implement
  abstract generateContent(request: LlmRequest): Promise<LlmResponse>
  abstract validateApiKey(): Promise<boolean>
  abstract getAvailableModels(): Promise<ModelInfo[]>
  abstract estimateCost(inputTokens: number, outputTokens: number, modelId: string): number

  // Common utility methods
  protected calculateLatency(startTime: number): number {
    return Date.now() - startTime
  }

  protected createError(message: string, type: LlmError['type'], code?: string): LlmError {
    return {
      message,
      code,
      type,
      retryable: this.isRetryable(type),
      provider: this.providerName
    }
  }

  protected isRetryable(type: LlmError['type']): boolean {
    return ['rate_limit', 'network_error', 'api_error'].includes(type)
  }

  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error
        
        // Don't retry if error is not retryable or this is the last attempt
        if (!this.isRetryable(error.type) || attempt === maxRetries) {
          throw error
        }

        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt) + Math.random() * 1000, 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw lastError
  }

  // Health check method
  async healthCheck(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      const isValid = await this.validateApiKey()
      const latency = this.calculateLatency(startTime)
      
      return {
        healthy: isValid,
        latency,
        error: isValid ? undefined : 'API key validation failed'
      }
    } catch (error: any) {
      return {
        healthy: false,
        latency: this.calculateLatency(startTime),
        error: error.message
      }
    }
  }
}
