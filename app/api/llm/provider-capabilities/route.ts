
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { EnhancedLlmService, EnhancedProviderFactory } from '@/lib/llm'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get provider capabilities
    const capabilities = await EnhancedLlmService.getProviderCapabilities(session.user.id)
    
    // Get supported providers
    const supportedProviders = EnhancedProviderFactory.getSupportedProviders()
    const aiSdkProviders = EnhancedProviderFactory.getAISDKProviders()
    
    // Get provider status
    const providerStatus = await EnhancedLlmService.getProviderStatus(session.user.id)

    const response = {
      supportedProviders,
      aiSdkProviders,
      capabilities,
      providerStatus,
      enhancedFeatures: {
        streamingGeneration: true,
        structuredOutput: true,
        providerFallback: true,
        costTracking: true,
        usageAnalytics: true
      }
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error: any) {
    console.error('Error getting provider capabilities:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get provider capabilities',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
