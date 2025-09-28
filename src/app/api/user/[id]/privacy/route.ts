import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if user is updating their own privacy settings
    if (session.user.id !== id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { hideLocation, hideCityNickname, hideFullName } = await request.json()

    // Update privacy settings
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hideLocation: hideLocation ?? false,
        hideCityNickname: hideCityNickname ?? false,
        hideFullName: hideFullName ?? false,
      },
      select: {
        id: true,
        hideLocation: true,
        hideCityNickname: true,
        hideFullName: true,
      }
    })

    return NextResponse.json({
      message: 'Privacy settings updated successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating privacy settings:', error)
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    )
  }
} 