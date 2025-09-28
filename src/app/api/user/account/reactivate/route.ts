import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user exists and is currently inactive
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, isActive: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.isActive) {
      return NextResponse.json({ error: 'Account is already active' }, { status: 400 })
    }

    // Reactivate the account
    await prisma.user.update({
      where: { id: session.user.id },
      data: { isActive: true }
    })

    return NextResponse.json({
      message: 'Account reactivated successfully',
      isActive: true
    })

  } catch (error) {
    console.error('Error reactivating account:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate account' },
      { status: 500 }
    )
  }
} 