
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
      maxTokens = 2000,
      temperature = 0.7,
      providerId,
      modelId
    } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' }, 
        { status: 400 }
      )
    }

    // Get the streaming response
    const streamingResponse = await EnhancedLlmService.streamBlogGeneration(
      session.user.id,
      prompt,
      {
        systemPrompt,
        maxTokens,
        temperature,
        providerId,
        modelId,
        metadata: {
          endpoint: 'stream-blog'
        }
      }
    )

    // Create a ReadableStream for Server-Sent Events
    const encoder = new TextEncoder()
    
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamingResponse.stream) {
            const eventData = JSON.stringify({
              content: chunk.content,
              done: chunk.done,
              metadata: streamingResponse.metadata
            })
            
            controller.enqueue(encoder.encode(`data: ${eventData}\n\n`))
            
            if (chunk.done) {
              controller.close()
              break
            }
          }
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })

  } catch (error: any) {
    console.error('Error streaming blog:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to stream blog content',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
