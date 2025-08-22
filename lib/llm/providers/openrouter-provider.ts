
import axios, { AxiosInstance } from 'axios'
import { BaseLlmProvider } from '../base-provider'
import { LlmRequest, LlmResponse, LlmError, ProviderConfig, ModelInfo } from '../types'

export class OpenRouterProvider extends BaseLlmProvider {
  private client: AxiosInstance

  constructor(config: ProviderConfig) {
    super(config, 'openrouter')
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://openrouter.ai/api/v1',
      timeout: config.timeoutMs,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    })
  }

  async generateContent(request: LlmRequest): Promise<LlmResponse> {
    const startTime = Date.now()
    
    try {
      return await this.withRetry(async () => {
        const response = await this.client.post('/chat/completions', {
          model: request.metadata?.model || 'anthropic/claude-3-opus',
          messages: [
            ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
            { role: 'user', content: request.prompt }
          ],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
          top_p: request.topP || 1.0
        })

        const data = response.data
        const choice = data.choices[0]
        
        if (!choice || !choice.message.content) {
          throw this.createError('No content generated', 'api_error')
        }

        const inputTokens = data.usage?.prompt_tokens || 0
        const outputTokens = data.usage?.completion_tokens || 0
        const model = data.model
        const cost = this.estimateCost(inputTokens, outputTokens, model)

        return {
          content: choice.message.content,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          cost,
          latencyMs: this.calculateLatency(startTime),
          model,
          provider: this.providerName,
          finishReason: choice.finish_reason || undefined
        }
      })
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw this.createError(error.response.data?.error?.message || 'Rate limit exceeded', 'rate_limit', 'rate_limit_exceeded')
      } else if (error.response?.status === 401) {
        throw this.createError(error.response.data?.error?.message || 'Invalid API key', 'auth_error', 'invalid_api_key')
      } else if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
        throw this.createError(error.message, 'network_error', error.code)
      }
      
      throw this.createError(error.response?.data?.error?.message || error.message || 'Unknown OpenRouter error', 'api_error', error.code)
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await this.client.get('/models')
      return response.status === 200
    } catch (error) {
      return false
    }
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.get('/models')
      
      return response.data.data.map((model: any) => ({
        id: model.id,
        name: model.id,
        displayName: model.name || model.id,
        inputCostPer1K: parseFloat(model.pricing?.prompt || '0'),
        outputCostPer1K: parseFloat(model.pricing?.completion || '0'),
        maxTokens: model.context_length || 4096,
        capabilities: this.getModelCapabilities(model)
      }))
    } catch (error) {
      return []
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, modelId: string): number {
    // OpenRouter pricing is dynamic and model-specific
    // This is a fallback estimation - real pricing should come from the API response
    const fallbackPricing = this.getFallbackModelPricing(modelId)
    return (inputTokens / 1000) * fallbackPricing.inputCostPer1K + (outputTokens / 1000) * fallbackPricing.outputCostPer1K
  }

  private getModelCapabilities(model: any): string[] {
    const capabilities = ['text']
    if (model.top_provider?.supports_vision) {
      capabilities.push('vision')
    }
    if (model.top_provider?.supports_function_calling) {
      capabilities.push('function_calling')
    }
    return capabilities
  }

  private getFallbackModelPricing(modelId: string): { inputCostPer1K: number; outputCostPer1K: number } {
    // Fallback pricing for common models if API pricing is not available
    const pricing: Record<string, { inputCostPer1K: number; outputCostPer1K: number }> = {
      'anthropic/claude-3-opus': { inputCostPer1K: 0.015, outputCostPer1K: 0.075 },
      'anthropic/claude-3-sonnet': { inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
      'anthropic/claude-3-haiku': { inputCostPer1K: 0.00025, outputCostPer1K: 0.00125 },
      'openai/gpt-4-turbo-preview': { inputCostPer1K: 0.01, outputCostPer1K: 0.03 },
      'openai/gpt-4': { inputCostPer1K: 0.03, outputCostPer1K: 0.06 },
      'openai/gpt-3.5-turbo': { inputCostPer1K: 0.0005, outputCostPer1K: 0.0015 }
    }
    return pricing[modelId] || { inputCostPer1K: 0.01, outputCostPer1K: 0.03 }
  }
}
