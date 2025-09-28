import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get users who have been active in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Find users with recent activity and calculate their "rising score"
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          // Users who created recordings recently
          { recordings: { some: { createdAt: { gte: thirtyDaysAgo } } } },
          // Users who received likes recently
          { recordings: { some: { likes: { some: { createdAt: { gte: thirtyDaysAgo } } } } } },
          // Users who received comments recently
          { recordings: { some: { comments: { some: { createdAt: { gte: thirtyDaysAgo } } } } } },
          // Users who gained followers recently
          { followers: { some: { createdAt: { gte: thirtyDaysAgo } } } }
        ]
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        tier: true,
        bio: true,
        totalVotes: true,
        createdAt: true,
        recordings: {
          where: {
            createdAt: { gte: thirtyDaysAgo },
            isPublic: true
          },
          select: {
            id: true,
            createdAt: true,
            likesCount: true,
            commentsCount: true,
            playsCount: true
          }
        },
        followers: {
          where: {
            createdAt: { gte: thirtyDaysAgo }
          },
          select: {
            createdAt: true
          }
        },
        _count: {
          select: {
            recordings: {
              where: { isPublic: true }
            },
            followers: true,
            following: true
          }
        }
      }
    })

    // Calculate rising scores for each user
    const risingUsers = users.map(user => {
      const now = new Date()
      
      // Count recent activity
      const recentRecordings = user.recordings.length
      const recentFollowers = user.followers.length
      const totalRecentLikes = user.recordings.reduce((sum, recording) => sum + recording.likesCount, 0)
      const totalRecentComments = user.recordings.reduce((sum, recording) => sum + recording.commentsCount, 0)
      const totalRecentPlays = user.recordings.reduce((sum, recording) => sum + recording.playsCount, 0)

      // Calculate account age in days
      const accountAgeInDays = (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      
      // Rising score calculation:
      // - Recent recordings (weight: 5)
      // - Recent engagement (likes + comments + plays) (weight: 1)
      // - Recent followers (weight: 3)
      // - Account age factor (newer accounts get bonus, but not too new)
      const engagementScore = totalRecentLikes + totalRecentComments + (totalRecentPlays * 0.1)
      const baseScore = (recentRecordings * 5) + engagementScore + (recentFollowers * 3)
      
      // Age factor: accounts 7-180 days old get a bonus (peak at 30-60 days)
      let ageFactor = 1
      if (accountAgeInDays >= 7 && accountAgeInDays <= 180) {
        if (accountAgeInDays <= 60) {
          ageFactor = 1 + (accountAgeInDays / 60) * 0.5 // Gradually increase to 1.5x
        } else {
          ageFactor = 1.5 - ((accountAgeInDays - 60) / 120) * 0.5 // Gradually decrease back to 1x
        }
      } else if (accountAgeInDays < 7) {
        ageFactor = 0.5 // Very new accounts get reduced score
      }

      const risingScore = Math.round(baseScore * ageFactor)

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        tier: user.tier,
        bio: user.bio,
        totalVotes: user.totalVotes,
        publicRecordings: user._count.recordings,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        risingScore,
        recentActivity: {
          recordings: recentRecordings,
          followers: recentFollowers,
          likes: totalRecentLikes,
          comments: totalRecentComments,
          plays: totalRecentPlays
        },
        accountAgeInDays: Math.round(accountAgeInDays)
      }
    })

    // Sort by rising score (highest first) and take top 20
    const topRising = risingUsers
      .filter(user => user.risingScore > 0) // Only include users with some activity
      .sort((a, b) => b.risingScore - a.risingScore)
      .slice(0, 20)

    return NextResponse.json({
      users: topRising,
      algorithm: {
        description: "Rising Score = (Recent Recordings × 5 + Engagement + Recent Followers × 3) × Age Factor",
        timeWindow: "30 days",
        maxResults: 20
      }
    })

  } catch (error) {
    console.error('Error fetching rising talent:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rising talent' },
      { status: 500 }
    )
  }
} 