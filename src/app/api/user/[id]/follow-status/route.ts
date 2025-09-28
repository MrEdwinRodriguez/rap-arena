import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    // Get current session
    const session = await getServerSession(authOptions)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isActive: true,
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let isFollowing = false
    let canFollow = true

    // Check if current user is following this user
    if (session?.user?.id) {
      // Can't follow yourself
      if (session.user.id === userId) {
        canFollow = false
      } else if (user.isActive) {
        const follow = await prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: userId
            }
          }
        })
        isFollowing = !!follow
      } else {
        // Can't follow deactivated users
        canFollow = false
      }
    } else {
      // Not logged in, can't follow
      canFollow = false
    }

    return NextResponse.json({
      isFollowing,
      canFollow,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      isActive: user.isActive
    })

  } catch (error) {
    console.error('Error checking follow status:', error)
    return NextResponse.json(
      { error: 'Failed to check follow status' },
      { status: 500 }
    )
  }
} 