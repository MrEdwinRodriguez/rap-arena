import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a test notification directly using Prisma
    const notification = await prisma.notification.create({
      data: {
        type: 'test',
        senderId: session.user.id,
        receiverId: session.user.id,
        title: 'Test Notification',
        message: 'This is a test notification to check if the system works'
      }
    })

    return NextResponse.json({
      message: 'Test notification created',
      notification
    })

  } catch (error) {
    console.error('Error creating test notification:', error)
    return NextResponse.json(
      { error: 'Failed to create test notification', details: error },
      { status: 500 }
    )
  }
} 