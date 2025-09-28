import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get following
    const following = await prisma.follow.findMany({
      where: {
        followerId: userId
      },
      select: {
        id: true,
        createdAt: true,
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            tier: true,
            bio: true,
            totalVotes: true,
            isActive: true,
            _count: {
              select: {
                recordings: {
                  where: { isPublic: true }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    })

    // Get total count
    const totalCount = await prisma.follow.count({
      where: {
        followerId: userId
      }
    })

    // Filter out deactivated users and format the response
    const activeFollowing = following
      .filter(follow => follow.following.isActive)
      .map(follow => ({
        id: follow.id,
        followedAt: follow.createdAt,
        user: {
          id: follow.following.id,
          name: follow.following.name,
          username: follow.following.username,
          image: follow.following.image,
          tier: follow.following.tier,
          bio: follow.following.bio,
          totalVotes: follow.following.totalVotes,
          publicRecordings: follow.following._count.recordings
        }
      }))

    return NextResponse.json({
      following: activeFollowing,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching following:', error)
    return NextResponse.json(
      { error: 'Failed to fetch following' },
      { status: 500 }
    )
  }
} 