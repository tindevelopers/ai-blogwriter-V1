
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createDataForSeoClient } from '@/lib/dataforseo'
import { prisma } from '@/lib/db'

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

    const { keywords } = await request.json()

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Keywords array is required' },
        { status: 400 }
      )
    }

    // Check if DataForSEO credentials are configured
    const login = process.env.DATAFORSEO_LOGIN
    const password = process.env.DATAFORSEO_PASSWORD

    if (!login || !password || login === 'your-dataforseo-login' || password === 'your-dataforseo-password') {
      // Mock data for development/demo
      const mockKeywordData = keywords.map((keyword: string) => ({
        keyword,
        searchVolume: Math.floor(Math.random() * 10000) + 1000,
        difficulty: Math.floor(Math.random() * 100),
        cpc: Number((Math.random() * 5).toFixed(2)),
        competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        relatedKeywords: [
          `${keyword} tips`,
          `${keyword} guide`,
          `best ${keyword}`,
          `${keyword} review`
        ]
      }))

      // Save to database
      for (const keywordData of mockKeywordData) {
        await prisma.keyword.upsert({
          where: { keyword: keywordData.keyword },
          update: {
            searchVolume: keywordData.searchVolume,
            difficulty: keywordData.difficulty,
            cpc: keywordData.cpc,
            competition: keywordData.competition,
            relatedKeywords: keywordData.relatedKeywords,
            updatedAt: new Date()
          },
          create: keywordData
        })
      }

      return NextResponse.json({
        success: true,
        data: mockKeywordData,
        message: 'Keyword analysis completed (demo data)'
      })
    }

    // Real DataForSEO integration
    const client = createDataForSeoClient({ login, password })
    
    const keywordData = await client.analyzeKeywords(keywords)

    // Save to database
    for (const data of keywordData) {
      await prisma.keyword.upsert({
        where: { keyword: data.keyword },
        update: {
          searchVolume: data.searchVolume,
          difficulty: data.difficulty,
          cpc: data.cpc,
          competition: data.competition,
          relatedKeywords: data.relatedKeywords,
          updatedAt: new Date()
        },
        create: data
      })
    }

    // Track API usage
    await prisma.apiUsage.create({
      data: {
        userId: session.user.id,
        apiType: 'dataforseo',
        endpoint: '/keywords/analyze',
        requestsCount: keywords.length,
        cost: keywords.length * 0.01 // Example cost calculation
      }
    })

    return NextResponse.json({
      success: true,
      data: keywordData,
      message: 'Keyword analysis completed'
    })
  } catch (error) {
    console.error('Keyword analysis error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
