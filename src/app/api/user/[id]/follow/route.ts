import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createFollowNotification } from '@/lib/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: followingId } = await params
    const followerId = session.user.id

    // Prevent users from following themselves
    if (followerId === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    // Check if the user to follow exists and is active
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, isActive: true }
    })

    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!userToFollow.isActive) {
      return NextResponse.json({ error: 'Cannot follow deactivated user' }, { status: 400 })
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following this user' }, { status: 400 })
    }

            // Create follow relationship
        await prisma.follow.create({
          data: {
            followerId,
            followingId
          }
        })

        // Create notification for the followed user
        await createFollowNotification(followerId, followingId)

        return NextResponse.json({
          message: 'Successfully followed user',
          isFollowing: true
        })

  } catch (error) {
    console.error('Error following user:', error)
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: followingId } = await params
    const followerId = session.user.id

    // Find and delete the follow relationship
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (!follow) {
      return NextResponse.json({ error: 'Not following this user' }, { status: 400 })
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    return NextResponse.json({
      message: 'Successfully unfollowed user',
      isFollowing: false
    })

  } catch (error) {
    console.error('Error unfollowing user:', error)
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 }
    )
  }
} 