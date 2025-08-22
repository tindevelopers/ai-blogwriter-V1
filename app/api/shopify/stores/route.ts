
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { createShopifyClient } from '@/lib/shopify'

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

    const stores = await prisma.shopifyStore.findMany({
      where: {
        userId: session.user.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: stores
    })
  } catch (error) {
    console.error('Get stores error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { storeName, storeUrl, accessToken } = await request.json()

    if (!storeName || !storeUrl || !accessToken) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Test connection first
    const shopifyClient = createShopifyClient({
      storeUrl,
      accessToken
    })

    const connectionTest = await shopifyClient.testConnection()
    
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to connect to Shopify store. Please check your credentials.' },
        { status: 400 }
      )
    }

    // Check if store already exists
    const existingStore = await prisma.shopifyStore.findFirst({
      where: {
        userId: session.user.id,
        storeUrl: storeUrl.replace(/https?:\/\//, '').replace(/\/$/, '')
      }
    })

    if (existingStore) {
      return NextResponse.json(
        { success: false, message: 'This store is already connected' },
        { status: 400 }
      )
    }

    // Create store
    const store = await prisma.shopifyStore.create({
      data: {
        userId: session.user.id,
        storeName,
        storeUrl: storeUrl.replace(/https?:\/\//, '').replace(/\/$/, ''),
        accessToken,
        isActive: true
      }
    })

    return NextResponse.json({
      success: true,
      data: store,
      message: 'Store connected successfully'
    })
  } catch (error) {
    console.error('Create store error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
