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

    const userId = session.user.id

    // Mark all unread notifications as read
    const result = await prisma.notification.updateMany({
      where: {
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({
      message: 'All notifications marked as read',
      updatedCount: result.count
    })

  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
} 