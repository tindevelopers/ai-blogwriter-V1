
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { LlmService } from '@/lib/llm'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const status = await LlmService.getProviderStatus(session.user.id)

    return NextResponse.json({
      success: true,
      data: status
    })

  } catch (error: any) {
    console.error('Provider status check error:', error)
    
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to check provider status' },
      { status: 500 }
    )
  }
}
