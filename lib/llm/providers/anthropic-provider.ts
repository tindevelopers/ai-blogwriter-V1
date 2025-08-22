
import Anthropic from '@anthropic-ai/sdk'
import { BaseLlmProvider } from '../base-provider'
import { LlmRequest, LlmResponse, LlmError, ProviderConfig, ModelInfo } from '../types'

export class AnthropicProvider extends BaseLlmProvider {
  private client: Anthropic

  constructor(config: ProviderConfig) {
    super(config, 'anthropic')
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeoutMs
    })
  }

  async generateContent(request: LlmRequest): Promise<LlmResponse> {
    const startTime = Date.now()
    
    try {
      return await this.withRetry(async () => {
        const message = await this.client.messages.create({
          model: request.metadata?.model || 'claude-3-opus-20240229',
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
          top_p: request.topP || 1.0,
          system: request.systemPrompt,
          messages: [
            { role: 'user', content: request.prompt }
          ]
        })

        if (!message.content[0] || message.content[0].type !== 'text') {
          throw this.createError('No text content generated', 'api_error')
        }

        const inputTokens = message.usage.input_tokens
        const outputTokens = message.usage.output_tokens
        const model = message.model
        const cost = this.estimateCost(inputTokens, outputTokens, model)

        return {
          content: message.content[0].text,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          cost,
          latencyMs: this.calculateLatency(startTime),
          model,
          provider: this.providerName,
          finishReason: message.stop_reason || undefined
        }
      })
    } catch (error: any) {
      if (error.status === 429) {
        throw this.createError(error.message, 'rate_limit', 'rate_limit_exceeded')
      } else if (error.status === 401) {
        throw this.createError(error.message, 'auth_error', 'invalid_api_key')
      } else if (error.name === 'APIConnectionError') {
        throw this.createError(error.message, 'network_error', error.code)
      }
      
      throw this.createError(error.message || 'Unknown Anthropic error', 'api_error', error.code)
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Test with a minimal message
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [{ role: 'user', content: 'Hi' }]
      })
      return true
    } catch (error: any) {
      return error.status !== 401
    }
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    // Anthropic doesn't have a public models endpoint, so we return known models
    return [
      {
        id: 'claude-3-opus-20240229',
        name: 'claude-3-opus-20240229',
        displayName: 'Claude 3 Opus',
        inputCostPer1K: 0.015,
        outputCostPer1K: 0.075,
        maxTokens: 200000,
        capabilities: ['text', 'vision']
      },
      {
        id: 'claude-3-sonnet-20240229',
        name: 'claude-3-sonnet-20240229',
        displayName: 'Claude 3 Sonnet',
        inputCostPer1K: 0.003,
        outputCostPer1K: 0.015,
        maxTokens: 200000,
        capabilities: ['text', 'vision']
      },
      {
        id: 'claude-3-haiku-20240307',
        name: 'claude-3-haiku-20240307',
        displayName: 'Claude 3 Haiku',
        inputCostPer1K: 0.00025,
        outputCostPer1K: 0.00125,
        maxTokens: 200000,
        capabilities: ['text', 'vision']
      }
    ]
  }

  estimateCost(inputTokens: number, outputTokens: number, modelId: string): number {
    const pricing = this.getModelPricing(modelId)
    return (inputTokens / 1000) * pricing.inputCostPer1K + (outputTokens / 1000) * pricing.outputCostPer1K
  }

  private getModelPricing(modelId: string): { inputCostPer1K: number; outputCostPer1K: number } {
    // Pricing as of August 2024 - update these values regularly
    const pricing: Record<string, { inputCostPer1K: number; outputCostPer1K: number }> = {
      'claude-3-opus-20240229': { inputCostPer1K: 0.015, outputCostPer1K: 0.075 },
      'claude-3-sonnet-20240229': { inputCostPer1K: 0.003, outputCostPer1K: 0.015 },
      'claude-3-haiku-20240307': { inputCostPer1K: 0.00025, outputCostPer1K: 0.00125 }
    }
    return pricing[modelId] || { inputCostPer1K: 0.003, outputCostPer1K: 0.015 }
  }
}
