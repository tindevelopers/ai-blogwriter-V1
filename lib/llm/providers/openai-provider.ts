
import OpenAI from 'openai'
import { BaseLlmProvider } from '../base-provider'
import { LlmRequest, LlmResponse, LlmError, ProviderConfig, ModelInfo } from '../types'

export class OpenAIProvider extends BaseLlmProvider {
  private client: OpenAI

  constructor(config: ProviderConfig) {
    super(config, 'openai')
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      timeout: config.timeoutMs
    })
  }

  async generateContent(request: LlmRequest): Promise<LlmResponse> {
    const startTime = Date.now()
    
    try {
      return await this.withRetry(async () => {
        const completion = await this.client.chat.completions.create({
          model: request.metadata?.model || 'gpt-4-turbo-preview',
          messages: [
            ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
            { role: 'user' as const, content: request.prompt }
          ],
          max_tokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
          top_p: request.topP || 1.0
        })

        const choice = completion.choices[0]
        if (!choice || !choice.message.content) {
          throw this.createError('No content generated', 'api_error')
        }

        const inputTokens = completion.usage?.prompt_tokens || 0
        const outputTokens = completion.usage?.completion_tokens || 0
        const model = completion.model
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
      if (error.code === 'rate_limit_exceeded') {
        throw this.createError(error.message, 'rate_limit', error.code)
      } else if (error.code === 'invalid_api_key') {
        throw this.createError(error.message, 'auth_error', error.code)
      } else if (error.name === 'APIConnectionError') {
        throw this.createError(error.message, 'network_error', error.code)
      }
      
      throw this.createError(error.message || 'Unknown OpenAI error', 'api_error', error.code)
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch (error) {
      return false
    }
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    try {
      const models = await this.client.models.list()
      
      // Filter and map OpenAI models to our format
      return models.data
        .filter(model => model.id.includes('gpt'))
        .map(model => this.mapOpenAIModel(model))
    } catch (error) {
      return []
    }
  }

  estimateCost(inputTokens: number, outputTokens: number, modelId: string): number {
    const pricing = this.getModelPricing(modelId)
    return (inputTokens / 1000) * pricing.inputCostPer1K + (outputTokens / 1000) * pricing.outputCostPer1K
  }

  private mapOpenAIModel(model: any): ModelInfo {
    const pricing = this.getModelPricing(model.id)
    return {
      id: model.id,
      name: model.id,
      displayName: this.getModelDisplayName(model.id),
      inputCostPer1K: pricing.inputCostPer1K,
      outputCostPer1K: pricing.outputCostPer1K,
      maxTokens: pricing.maxTokens,
      capabilities: ['text']
    }
  }

  private getModelDisplayName(modelId: string): string {
    const displayNames: Record<string, string> = {
      'gpt-4-turbo-preview': 'GPT-4 Turbo Preview',
      'gpt-4-0125-preview': 'GPT-4 Turbo',
      'gpt-4-1106-preview': 'GPT-4 Turbo',
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-3.5-turbo-16k': 'GPT-3.5 Turbo 16K'
    }
    return displayNames[modelId] || modelId
  }

  private getModelPricing(modelId: string): { inputCostPer1K: number; outputCostPer1K: number; maxTokens: number } {
    // Pricing as of August 2024 - update these values regularly
    const pricing: Record<string, { inputCostPer1K: number; outputCostPer1K: number; maxTokens: number }> = {
      'gpt-4-turbo-preview': { inputCostPer1K: 0.01, outputCostPer1K: 0.03, maxTokens: 128000 },
      'gpt-4-0125-preview': { inputCostPer1K: 0.01, outputCostPer1K: 0.03, maxTokens: 128000 },
      'gpt-4-1106-preview': { inputCostPer1K: 0.01, outputCostPer1K: 0.03, maxTokens: 128000 },
      'gpt-4': { inputCostPer1K: 0.03, outputCostPer1K: 0.06, maxTokens: 8192 },
      'gpt-3.5-turbo': { inputCostPer1K: 0.0005, outputCostPer1K: 0.0015, maxTokens: 16385 },
      'gpt-3.5-turbo-16k': { inputCostPer1K: 0.003, outputCostPer1K: 0.004, maxTokens: 16385 }
    }
    return pricing[modelId] || { inputCostPer1K: 0.01, outputCostPer1K: 0.03, maxTokens: 4096 }
  }
}
