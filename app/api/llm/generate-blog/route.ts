
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { LlmService } from '@/lib/llm'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      prompt,
      systemPrompt,
      maxTokens,
      temperature,
      topP,
      model,
      metadata
    } = body

    if (!prompt) {
      return NextResponse.json(
        { success: false, message: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Generate blog content using LLM service
    const response = await LlmService.generateBlogContent(
      session.user.id,
      prompt,
      {
        systemPrompt,
        maxTokens,
        temperature,
        topP,
        model,
        metadata
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        content: response.content,
        usage: {
          inputTokens: response.inputTokens,
          outputTokens: response.outputTokens,
          totalTokens: response.totalTokens,
          cost: response.cost
        },
        model: response.model,
        provider: response.provider,
        latencyMs: response.latencyMs
      }
    })

  } catch (error: any) {
    console.error('LLM generation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to generate content',
        error: {
          type: error.type || 'unknown',
          provider: error.provider || 'unknown'
        }
      },
      { status: 500 }
    )
  }
}
