
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createShopifyClient } from '@/lib/shopify'

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

    const { storeUrl, accessToken } = await request.json()

    if (!storeUrl || !accessToken) {
      return NextResponse.json(
        { success: false, message: 'Store URL and access token are required' },
        { status: 400 }
      )
    }

    const shopifyClient = createShopifyClient({
      storeUrl,
      accessToken
    })

    const result = await shopifyClient.testConnection()

    return NextResponse.json(result)
  } catch (error) {
    console.error('Shopify connection test error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
