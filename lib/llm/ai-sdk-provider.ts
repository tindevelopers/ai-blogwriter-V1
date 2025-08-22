
import { generateText, generateObject, streamText, type CoreMessage, type LanguageModel } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { groq } from '@ai-sdk/groq'
import { mistral } from '@ai-sdk/mistral'
import { cohere } from '@ai-sdk/cohere'
import { z } from 'zod'
import { BaseLlmProvider } from './base-provider'
import { LlmRequest, LlmResponse, LlmError, ProviderConfig, ModelInfo } from './types'

export type AISDKProvider = 'openai' | 'anthropic' | 'groq' | 'mistral' | 'cohere'

// Schema for structured blog generation
export const BlogStructureSchema = z.object({
  title: z.string().describe('SEO-optimized blog title'),
  metaDescription: z.string().max(160).describe('Meta description for SEO'),
  sections: z.array(z.object({
    heading: z.string(),
    content: z.string(),
    keywords: z.array(z.string()).optional().describe('SEO keywords for this section')
  })),
  tags: z.array(z.string()).optional().describe('Blog tags'),
  seoKeywords: z.array(z.string()).describe('Primary SEO keywords for the entire post')
})

export class AISdkProvider extends BaseLlmProvider {
  private model: LanguageModel
  private providerType: AISDKProvider
  private modelId: string

  constructor(
    config: ProviderConfig, 
    providerType: AISDKProvider, 
    modelId: string
  ) {
    super(config, `ai-sdk-${providerType}`)
    this.providerType = providerType
    this.modelId = modelId
    
    // Set API key as environment variable for the AI SDK
    this.setEnvironmentApiKey(providerType, config.apiKey)
    this.model = this.initializeModel(providerType, modelId, config)
  }

  private setEnvironmentApiKey(providerType: AISDKProvider, apiKey: string): void {
    const envVarMap: Record<AISDKProvider, string> = {
      'openai': 'OPENAI_API_KEY',
      'anthropic': 'ANTHROPIC_API_KEY',
      'groq': 'GROQ_API_KEY',
      'mistral': 'MISTRAL_API_KEY',
      'cohere': 'COHERE_API_KEY'
    }
    
    const envVar = envVarMap[providerType]
    if (envVar) {
      process.env[envVar] = apiKey
    }
  }

  private initializeModel(providerType: AISDKProvider, modelId: string, config: ProviderConfig): LanguageModel {
    switch (providerType) {
      case 'openai':
        return openai(modelId)
      case 'anthropic':
        return anthropic(modelId)
      case 'groq':
        return groq(modelId)
      case 'mistral':  
        return mistral(modelId)
      case 'cohere':
        return cohere(modelId)
      default:
        throw new Error(`Unsupported AI SDK provider: ${providerType}`)
    }
  }

  async generateContent(request: LlmRequest): Promise<LlmResponse> {
    const startTime = Date.now()
    
    try {
      return await this.withRetry(async () => {
        const messages: CoreMessage[] = []
        
        if (request.systemPrompt) {
          messages.push({ role: 'system', content: request.systemPrompt })
        }
        
        messages.push({ role: 'user', content: request.prompt })

        const result = await generateText({
          model: this.model,
          messages,
          maxTokens: request.maxTokens || 2000,
          temperature: request.temperature || 0.7,
          topP: request.topP || 1.0
        })

        const inputTokens = result.usage.promptTokens || 0
        const outputTokens = result.usage.completionTokens || 0
        const cost = this.estimateCost(inputTokens, outputTokens, this.modelId)

        return {
          content: result.text,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          cost,
          latencyMs: this.calculateLatency(startTime),
          model: this.modelId,
          provider: this.providerName,
          finishReason: result.finishReason || undefined
        }
      })
    } catch (error: any) {
      throw this.mapError(error)
    }
  }

  // New method for structured blog generation
  async generateStructuredBlog(request: LlmRequest): Promise<LlmResponse & { structuredData: z.infer<typeof BlogStructureSchema> }> {
    const startTime = Date.now()
    
    try {
      return await this.withRetry(async () => {
        const messages: CoreMessage[] = []
        
        if (request.systemPrompt) {
          messages.push({ role: 'system', content: request.systemPrompt })
        }
        
        messages.push({ role: 'user', content: request.prompt })

        const result = await generateObject({
          model: this.model,
          messages,
          schema: BlogStructureSchema,
          maxTokens: request.maxTokens || 3000,
          temperature: request.temperature || 0.7,
          topP: request.topP || 1.0
        })

        const inputTokens = result.usage.promptTokens || 0
        const outputTokens = result.usage.completionTokens || 0
        const cost = this.estimateCost(inputTokens, outputTokens, this.modelId)

        // Convert structured data back to content string for compatibility
        const content = this.formatStructuredBlogAsHTML(result.object)

        return {
          content,
          inputTokens,
          outputTokens,
          totalTokens: inputTokens + outputTokens,
          cost,
          latencyMs: this.calculateLatency(startTime),
          model: this.modelId,
          provider: this.providerName,
          finishReason: result.finishReason || undefined,
          structuredData: result.object
        }
      })
    } catch (error: any) {
      throw this.mapError(error)
    }
  }

  // New method for streaming content generation
  async *streamContent(request: LlmRequest): AsyncGenerator<{ content: string; done: boolean }> {
    try {
      const messages: CoreMessage[] = []
      
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt })
      }
      
      messages.push({ role: 'user', content: request.prompt })

      const result = await streamText({
        model: this.model,
        messages,
        maxTokens: request.maxTokens || 2000,
        temperature: request.temperature || 0.7,
        topP: request.topP || 1.0
      })

      for await (const delta of result.textStream) {
        yield { content: delta, done: false }
      }
      
      yield { content: '', done: true }
    } catch (error: any) {
      throw this.mapError(error)
    }
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await generateText({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        maxTokens: 1
      })
      return true
    } catch (error) {
      return false
    }
  }

  async getAvailableModels(): Promise<ModelInfo[]> {
    // Return predefined models since AI SDK doesn't expose model listing for all providers
    return this.getPredefinedModels(this.providerType)
  }

  estimateCost(inputTokens: number, outputTokens: number, modelId: string): number {
    const pricing = this.getModelPricing(this.providerType, modelId)
    return (inputTokens / 1000) * pricing.inputCostPer1K + (outputTokens / 1000) * pricing.outputCostPer1K
  }

  private mapError(error: any): LlmError {
    // Map AI SDK errors to our error format
    if (error.name === 'AI_APICallError') {
      if (error.statusCode === 429) {
        return this.createError(error.message, 'rate_limit', 'rate_limit_exceeded')
      } else if (error.statusCode === 401) {
        return this.createError(error.message, 'auth_error', 'invalid_api_key')
      }
      return this.createError(error.message, 'api_error', error.statusCode?.toString())
    }
    
    if (error.name === 'AI_RetryError') {
      return this.createError(error.message, 'network_error', 'retry_failed')
    }

    return this.createError(error.message || 'Unknown AI SDK error', 'unknown', error.code)
  }

  private formatStructuredBlogAsHTML(blogData: z.infer<typeof BlogStructureSchema>): string {
    let html = `<h1>${blogData.title}</h1>\n\n`
    
    for (const section of blogData.sections) {
      html += `<h2>${section.heading}</h2>\n`
      html += `${section.content}\n\n`
    }
    
    if (blogData.tags && blogData.tags.length > 0) {
      html += `<!-- Tags: ${blogData.tags.join(', ')} -->\n`
    }
    
    if (blogData.seoKeywords && blogData.seoKeywords.length > 0) {
      html += `<!-- SEO Keywords: ${blogData.seoKeywords.join(', ')} -->\n`
    }
    
    return html
  }

  private getPredefinedModels(providerType: AISDKProvider): ModelInfo[] {
    const models = {
      openai: [
        {
          id: 'gpt-4o',
          name: 'gpt-4o',
          displayName: 'GPT-4o',
          inputCostPer1K: 0.005,
          outputCostPer1K: 0.015,
          maxTokens: 128000,
          capabilities: ['text', 'vision']
        },
        {
          id: 'gpt-4o-mini',
          name: 'gpt-4o-mini',
          displayName: 'GPT-4o Mini',
          inputCostPer1K: 0.00015,
          outputCostPer1K: 0.0006,
          maxTokens: 128000,
          capabilities: ['text', 'vision']
        },
        {
          id: 'gpt-4-turbo',
          name: 'gpt-4-turbo',
          displayName: 'GPT-4 Turbo',
          inputCostPer1K: 0.01,
          outputCostPer1K: 0.03,
          maxTokens: 128000,
          capabilities: ['text', 'vision']
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'gpt-3.5-turbo',
          displayName: 'GPT-3.5 Turbo',
          inputCostPer1K: 0.0005,
          outputCostPer1K: 0.0015,
          maxTokens: 16385,
          capabilities: ['text']
        }
      ],
      anthropic: [
        {
          id: 'claude-3-5-sonnet-20241022',
          name: 'claude-3-5-sonnet-20241022',
          displayName: 'Claude 3.5 Sonnet',
          inputCostPer1K: 0.003,
          outputCostPer1K: 0.015,
          maxTokens: 200000,
          capabilities: ['text', 'vision']
        },
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
          id: 'claude-3-haiku-20240307',
          name: 'claude-3-haiku-20240307',
          displayName: 'Claude 3 Haiku',
          inputCostPer1K: 0.00025,
          outputCostPer1K: 0.00125,
          maxTokens: 200000,
          capabilities: ['text', 'vision']
        }
      ],
      groq: [
        {
          id: 'llama-3.1-70b-versatile',
          name: 'llama-3.1-70b-versatile',
          displayName: 'Llama 3.1 70B',
          inputCostPer1K: 0.00059,
          outputCostPer1K: 0.00079,
          maxTokens: 131072,
          capabilities: ['text']
        },
        {
          id: 'llama-3.1-8b-instant',
          name: 'llama-3.1-8b-instant',
          displayName: 'Llama 3.1 8B',
          inputCostPer1K: 0.00005,
          outputCostPer1K: 0.00008,
          maxTokens: 131072,
          capabilities: ['text']
        },
        {
          id: 'mixtral-8x7b-32768',
          name: 'mixtral-8x7b-32768',
          displayName: 'Mixtral 8x7B',
          inputCostPer1K: 0.00024,
          outputCostPer1K: 0.00024,
          maxTokens: 32768,
          capabilities: ['text']
        }
      ],
      mistral: [
        {
          id: 'mistral-large-latest',
          name: 'mistral-large-latest',
          displayName: 'Mistral Large',
          inputCostPer1K: 0.004,
          outputCostPer1K: 0.012,
          maxTokens: 128000,
          capabilities: ['text']
        },
        {
          id: 'mistral-medium-latest',
          name: 'mistral-medium-latest',
          displayName: 'Mistral Medium',
          inputCostPer1K: 0.0025,
          outputCostPer1K: 0.0075,
          maxTokens: 32000,
          capabilities: ['text']
        },
        {
          id: 'mistral-small-latest',
          name: 'mistral-small-latest',
          displayName: 'Mistral Small',
          inputCostPer1K: 0.002,
          outputCostPer1K: 0.006,
          maxTokens: 32000,
          capabilities: ['text']
        }
      ],
      cohere: [
        {
          id: 'command-r-plus',
          name: 'command-r-plus',
          displayName: 'Command R+',
          inputCostPer1K: 0.003,
          outputCostPer1K: 0.015,
          maxTokens: 128000,
          capabilities: ['text']
        },
        {
          id: 'command-r',
          name: 'command-r',
          displayName: 'Command R',
          inputCostPer1K: 0.0005,
          outputCostPer1K: 0.0015,
          maxTokens: 128000,
          capabilities: ['text']
        },
        {
          id: 'command-light',
          name: 'command-light',
          displayName: 'Command Light',
          inputCostPer1K: 0.0003,
          outputCostPer1K: 0.0006,
          maxTokens: 4096,
          capabilities: ['text']
        }
      ]
    }

    return models[providerType] || []
  }

  private getModelPricing(providerType: AISDKProvider, modelId: string): { inputCostPer1K: number; outputCostPer1K: number } {
    const models = this.getPredefinedModels(providerType)
    const model = models.find(m => m.id === modelId)
    return model ? 
      { inputCostPer1K: model.inputCostPer1K, outputCostPer1K: model.outputCostPer1K } :
      { inputCostPer1K: 0.001, outputCostPer1K: 0.002 } // fallback pricing
  }
}
