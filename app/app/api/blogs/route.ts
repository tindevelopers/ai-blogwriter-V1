
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

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

    const blogs = await prisma.blog.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        store: true,
        _count: {
          select: {
            articles: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: blogs
    })
  } catch (error) {
    console.error('Get blogs error:', error)
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

    const { title, description, storeId } = await request.json()

    if (!title || !storeId) {
      return NextResponse.json(
        { success: false, message: 'Title and store are required' },
        { status: 400 }
      )
    }

    // Verify store belongs to user
    const store = await prisma.shopifyStore.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
        isActive: true
      }
    })

    if (!store) {
      return NextResponse.json(
        { success: false, message: 'Store not found or not accessible' },
        { status: 404 }
      )
    }

    // Create blog
    const blog = await prisma.blog.create({
      data: {
        userId: session.user.id,
        storeId,
        title,
        description: description || null,
        status: 'draft'
      },
      include: {
        store: true,
        _count: {
          select: {
            articles: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: blog,
      message: 'Blog created successfully'
    })
  } catch (error) {
    console.error('Create blog error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
