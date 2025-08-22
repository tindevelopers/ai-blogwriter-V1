
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [providers, userPreference] = await Promise.all([
      prisma.llmProvider.findMany({
        include: {
          models: {
            where: { isEnabled: true },
            orderBy: { quality: 'asc' }
          }
        },
        orderBy: { priority: 'asc' }
      }),
      prisma.agencyLlmPreference.findUnique({
        where: { userId: session.user.id },
        include: {
          provider: true,
          model: true
        }
      })
    ])

    return NextResponse.json({
      providers,
      userPreference
    })
  } catch (error) {
    console.error('Error fetching LLM providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch LLM providers' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { providerId, modelId, maxQuality, enableFallback, maxCostPer1K } = data

    const preference = await prisma.agencyLlmPreference.upsert({
      where: { userId: session.user.id },
      update: {
        providerId,
        modelId,
        maxQuality,
        enableFallback,
        maxCostPer1K
      },
      create: {
        userId: session.user.id,
        providerId,
        modelId,
        maxQuality,
        enableFallback,
        maxCostPer1K
      }
    })

    return NextResponse.json(preference)
  } catch (error) {
    console.error('Error updating LLM preference:', error)
    return NextResponse.json(
      { error: 'Failed to update LLM preference' },
      { status: 500 }
    )
  }
}
