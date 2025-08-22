
// Base types for LLM abstraction layer

export interface LlmRequest {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  topP?: number
  userId: string
  requestType: string
  metadata?: Record<string, any>
}

export interface LlmResponse {
  content: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  cost: number
  latencyMs: number
  model: string
  provider: string
  finishReason?: string
}

export interface LlmError {
  message: string
  code?: string
  type: 'rate_limit' | 'api_error' | 'network_error' | 'auth_error' | 'unknown'
  retryable: boolean
  provider: string
}

export interface ProviderConfig {
  apiKey: string
  baseUrl?: string
  maxRetries: number
  timeoutMs: number
}

export interface ModelInfo {
  id: string
  name: string
  displayName: string
  inputCostPer1K: number
  outputCostPer1K: number
  maxTokens: number
  capabilities: string[]
}

export enum ModelQuality {
  BASIC = 'BASIC',
  PRO = 'PRO', 
  ENTERPRISE = 'ENTERPRISE'
}

export interface FallbackConfig {
  enableFallback: boolean
  maxRetries: number
  providers: string[]
}
