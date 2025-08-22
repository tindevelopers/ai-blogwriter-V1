
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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const dateFilter = {
      gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    }

    const [usageLogs, summary] = await Promise.all([
      prisma.llmUsageLog.findMany({
        where: {
          userId: session.user.id,
          createdAt: dateFilter
        },
        include: {
          provider: true,
          model: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      }),
      prisma.llmUsageLog.groupBy({
        by: ['providerId'],
        where: {
          userId: session.user.id,
          createdAt: dateFilter
        },
        _sum: {
          inputTokens: true,
          outputTokens: true,
          totalCost: true
        },
        _count: true
      })
    ])

    // Get provider names for summary
    const providers = await prisma.llmProvider.findMany({
      where: {
        id: { in: summary.map((s: { providerId: string }) => s.providerId) }
      }
    })

    const enhancedSummary = summary.map((s: { providerId: string }) => {
      const provider = providers.find((p: { id: string; displayName: string }) => p.id === s.providerId)
      return {
        ...s,
        providerName: provider?.displayName || 'Unknown'
      }
    })

    // Calculate totals
    const totals = {
      totalRequests: usageLogs.length,
      totalInputTokens: usageLogs.reduce((sum: number, log: any) => sum + log.inputTokens, 0),
      totalOutputTokens: usageLogs.reduce((sum: number, log: any) => sum + log.outputTokens, 0),
      totalCost: usageLogs.reduce((sum: number, log: any) => sum + log.totalCost, 0),
      successRate: usageLogs.length ? (usageLogs.filter((log: any) => log.isSuccess).length / usageLogs.length) * 100 : 0
    }

    return NextResponse.json({
      usageLogs,
      summary: enhancedSummary,
      totals
    })
  } catch (error) {
    console.error('Error fetching usage analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage analytics' },
      { status: 500 }
    )
  }
}
