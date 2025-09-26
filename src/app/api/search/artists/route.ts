import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const tier = searchParams.get('tier')
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        users: [],
        message: 'No search query provided'
      })
    }

    // Build search conditions
    const searchConditions: any = {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          username: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Add tier filter if provided
    if (tier) {
      const tierNumber = parseInt(tier, 10)
      if (!isNaN(tierNumber)) {
        searchConditions.tier = tierNumber
      }
    }

    const users = await prisma.user.findMany({
      where: searchConditions,
      select: {
        id: true,
        name: true,
        username: true,
        email: false, // Don't expose email in search results
        image: true,
        tier: true,
        bio: true,
        totalVotes: true,
        createdAt: true,
        _count: {
          select: {
            recordings: {
              where: {
                isPublic: true
              }
            }
          }
        }
      },
      orderBy: [
        { tier: 'desc' }, // Higher tier users first
        { totalVotes: 'desc' }, // Then by total votes
        { createdAt: 'desc' } // Then by join date
      ],
      take: limit
    })

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      tier: user.tier,
      bio: user.bio,
      totalVotes: user.totalVotes,
      publicRecordings: user._count.recordings,
      joinedAt: user.createdAt
    }))

    return NextResponse.json({
      users: transformedUsers,
      count: transformedUsers.length,
      query
    })

  } catch (error) {
    console.error('Error searching artists:', error)
    return NextResponse.json(
      { error: 'Failed to search artists' },
      { status: 500 }
    )
  }
} 