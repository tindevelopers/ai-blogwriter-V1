

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const agencies = await prisma.agency.findMany({
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true
          }
        },
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            isActive: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(agencies)
  } catch (error) {
    console.error('Error fetching agencies:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'name', 'slug', 'ownerFirstName', 'ownerLastName', 
      'ownerEmail', 'ownerPassword', 'subscriptionPlan'
    ]
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` }, 
          { status: 400 }
        )
      }
    }

    // Check if slug is unique
    const existingAgency = await prisma.agency.findUnique({
      where: { slug: data.slug }
    })
    
    if (existingAgency) {
      return NextResponse.json(
        { error: 'Agency slug already exists' }, 
        { status: 400 }
      )
    }

    // Check if owner email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.ownerEmail }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' }, 
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.ownerPassword, 12)

    // Create agency and owner in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create the agency owner first
      const owner = await tx.user.create({
        data: {
          firstName: data.ownerFirstName,
          lastName: data.ownerLastName,
          email: data.ownerEmail,
          password: hashedPassword,
          role: 'AGENCY_ADMIN',
          companyName: data.name
        }
      })

      // Create the agency
      const agency = await tx.agency.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          ownerId: owner.id,
          subscriptionPlan: data.subscriptionPlan,
          subscriptionStatus: 'active',
          billingEmail: data.billingEmail || data.ownerEmail,
          maxUsers: data.maxUsers || 5,
          maxStores: data.maxStores || 10,
          maxBlogCredits: data.maxBlogCredits || 100,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          hideOurBranding: data.hideOurBranding || false,
          customSupportEmail: data.customSupportEmail,
          allowCustomLlm: data.allowCustomLlm || false,
          allowApiAccess: data.allowApiAccess || false,
          apiRateLimit: data.apiRateLimit || 1000
        }
      })

      // Update the owner to link to the agency
      await tx.user.update({
        where: { id: owner.id },
        data: { agencyId: agency.id }
      })

      return { agency, owner }
    })

    // Return the created agency with owner info
    const agencyWithOwner = await prisma.agency.findUnique({
      where: { id: result.agency.id },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true
          }
        },
        users: true
      }
    })

    return NextResponse.json(agencyWithOwner, { status: 201 })
  } catch (error) {
    console.error('Error creating agency:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

