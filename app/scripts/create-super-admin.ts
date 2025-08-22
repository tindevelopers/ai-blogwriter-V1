

import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

config()
const prisma = new PrismaClient()

async function createSuperAdmin() {
  try {
    console.log('Creating Super Admin user...')

    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12)

    const existingSuperAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (existingSuperAdmin) {
      console.log('Super Admin already exists:', existingSuperAdmin.email)
      return
    }

    const superAdmin = await prisma.user.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@blogwriter.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        companyName: 'BlogWriter Platform',
        isActive: true
      }
    })

    console.log('Super Admin created successfully!')
    console.log('Email: superadmin@blogwriter.com')
    console.log('Password: SuperAdmin123!')
    console.log('User ID:', superAdmin.id)

  } catch (error) {
    console.error('Error creating Super Admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()

