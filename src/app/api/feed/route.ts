import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    const userId = session.user.id

    // Get IDs of users this user is following + their own ID
    const followingRelations = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    })
    
    const followingIds = followingRelations.map(f => f.followingId)
    const feedUserIds = [...followingIds, userId] // Include own content

    // Get posts from followed users + own posts
    const posts = await prisma.post.findMany({
      where: {
        userId: { in: feedUserIds },
        user: { isActive: true }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            tier: true
          }
        },
        recording: {
          select: {
            id: true,
            title: true,
            isPublic: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Get recordings from followed users + own recordings
    const recordings = await prisma.recording.findMany({
      where: {
        userId: { in: feedUserIds },
        isPublic: true,
        user: { isActive: true }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            tier: true
          }
        },
        beat: {
          select: {
            id: true,
            title: true,
            genre: true,
            bpm: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Get beats from followed users + own beats
    const beats = await prisma.beat.findMany({
      where: {
        userId: { in: feedUserIds },
        isPublic: true,
        user: { isActive: true }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            tier: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Combine all feed items with type indicator and sort by creation date
    const feedItems = [
      ...posts.map(post => ({
        ...post,
        type: 'post' as const,
        sortDate: post.createdAt
      })),
      ...recordings.map(recording => ({
        ...recording,
        type: 'recording' as const,
        sortDate: recording.createdAt
      })),
      ...beats.map(beat => ({
        ...beat,
        type: 'beat' as const,
        sortDate: beat.createdAt
      }))
    ].sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
    .slice(0, limit)

    // Get total count for pagination (simplified)
    const totalPosts = await prisma.post.count({
      where: {
        userId: { in: feedUserIds },
        user: { isActive: true }
      }
    })

    const totalRecordings = await prisma.recording.count({
      where: {
        userId: { in: feedUserIds },
        isPublic: true,
        user: { isActive: true }
      }
    })

    const totalBeats = await prisma.beat.count({
      where: {
        userId: { in: feedUserIds },
        isPublic: true,
        user: { isActive: true }
      }
    })

    const totalItems = totalPosts + totalRecordings + totalBeats

    return NextResponse.json({
      items: feedItems,
      pagination: {
        page,
        limit,
        total: totalItems,
        totalPages: Math.ceil(totalItems / limit),
        hasNext: page * limit < totalItems,
        hasPrev: page > 1
      },
      stats: {
        totalPosts,
        totalRecordings,
        totalBeats,
        followingCount: followingIds.length
      }
    })

  } catch (error) {
    console.error('Error fetching social feed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
} 