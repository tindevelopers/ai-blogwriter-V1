
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { EnhancedLlmService } from '@/lib/llm'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      prompt, 
      systemPrompt,
      maxTokens = 3000,
      temperature = 0.7,
      providerId,
      modelId,
      useStructured = true
    } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' }, 
        { status: 400 }
      )
    }

    const options = {
      systemPrompt,
      maxTokens,
      temperature,
      providerId,
      modelId,
      metadata: {
        endpoint: 'generate-structured-blog',
        useStructured
      }
    }

    let response

    if (useStructured) {
      // Use enhanced structured generation
      response = await EnhancedLlmService.generateStructuredBlog(
        session.user.id,
        prompt,
        options
      )
    } else {
      // Use regular generation
      response = await EnhancedLlmService.generateBlogContent(
        session.user.id,
        prompt,
        options
      )
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error: any) {
    console.error('Error generating structured blog:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate blog content',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
