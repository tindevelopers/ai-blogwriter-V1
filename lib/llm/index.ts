
// Main exports for the LLM abstraction layer

export { BaseLlmProvider } from './base-provider'
export { LlmRouter, type RouterConfig } from './llm-router'
export type {
  LlmRequest,
  LlmResponse,
  LlmError,
  ProviderConfig,
  ModelInfo,
  ModelQuality,
  FallbackConfig
} from './types'

// Legacy providers (for backward compatibility)
export { OpenAIProvider } from './providers/openai-provider'
export { AnthropicProvider } from './providers/anthropic-provider'
export { OpenRouterProvider } from './providers/openrouter-provider'

// Enhanced AI SDK exports
export { 
  AISdkProvider, 
  type AISDKProvider, 
  BlogStructureSchema 
} from './ai-sdk-provider'

export { 
  EnhancedProviderFactory, 
  type ProviderMode
} from './enhanced-provider-factory'

export { 
  EnhancedLlmService,
  type StreamingResponse,
  type StructuredBlogResponse
} from './enhanced-llm-service'

// Main exports (Enhanced versions are now default)
export { 
  EnhancedProviderFactory as ProviderFactory,
  type SupportedProvider
} from './enhanced-provider-factory'

export { 
  EnhancedLlmService as LlmService
} from './enhanced-llm-service'

// Legacy service export for backward compatibility  
export { LlmService as LegacyLlmService } from './llm-service'
