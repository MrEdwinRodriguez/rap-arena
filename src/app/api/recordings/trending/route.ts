import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get recordings from the last 7 days that are public
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recordings = await prisma.recording.findMany({
      where: {
        isPublic: true,
        OR: [
          // Recordings created in the last 7 days
          { createdAt: { gte: sevenDaysAgo } },
          // OR recordings with recent engagement (likes, comments, plays in last 7 days)
          {
            OR: [
              { likes: { some: { createdAt: { gte: sevenDaysAgo } } } },
              { comments: { some: { createdAt: { gte: sevenDaysAgo } } } },
              { plays: { some: { createdAt: { gte: sevenDaysAgo } } } }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
        beat: {
          select: {
            id: true,
            title: true,
            genre: true,
            bpm: true,
          }
        },
        likes: {
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true }
        },
        comments: {
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true }
        },
        plays: {
          where: { createdAt: { gte: sevenDaysAgo } },
          select: { createdAt: true, completed: true }
        }
      }
    })

    // Calculate trending scores
    const trendingRecordings = recordings.map(recording => {
      const now = new Date()
      
      // Count recent engagement
      const recentLikes = recording.likes.length
      const recentComments = recording.comments.length
      const recentPlays = recording.plays.length
      const completedPlays = recording.plays.filter(play => play.completed).length
      
      // Calculate engagement score
      // Trending Score = (Likes × 3 + Comments × 2 + Plays × 1) × Time Decay × Velocity Multiplier
      const baseScore = (recentLikes * 3) + (recentComments * 2) + (recentPlays * 1)
      
      // Time decay factor (more recent activity weighted higher)
      const allEngagement = [
        ...recording.likes.map(like => like.createdAt),
        ...recording.comments.map(comment => comment.createdAt),
        ...recording.plays.map(play => play.createdAt)
      ]
      
      let timeDecay = 1
      if (allEngagement.length > 0) {
        // Get the most recent engagement
        const mostRecentEngagement = new Date(Math.max(...allEngagement.map(date => date.getTime())))
        const hoursAgo = (now.getTime() - mostRecentEngagement.getTime()) / (1000 * 60 * 60)
        
        // Exponential decay: newer activity gets higher weight
        // Activity in last 24 hours gets full weight, decays exponentially after that
        timeDecay = Math.exp(-hoursAgo / 48) // 48-hour half-life
      }
      
      // Velocity multiplier (engagement rate per day)
      let velocityMultiplier = 1
      if (allEngagement.length > 0) {
        const oldestEngagement = new Date(Math.min(...allEngagement.map(date => date.getTime())))
        const timeSpanHours = Math.max(1, (now.getTime() - oldestEngagement.getTime()) / (1000 * 60 * 60))
        const engagementRate = allEngagement.length / (timeSpanHours / 24) // engagement per day
        
        // Boost recordings that are gaining engagement quickly
        velocityMultiplier = Math.min(3, 1 + (engagementRate / 10)) // Cap at 3x multiplier
      }
      
      // Special boost for recordings created recently (within 48 hours)
      let freshnessBoost = 1
      const recordingAge = (now.getTime() - recording.createdAt.getTime()) / (1000 * 60 * 60)
      if (recordingAge <= 48) {
        freshnessBoost = 1.5
      }
      
      // Calculate final trending score
      const trendingScore = baseScore * timeDecay * velocityMultiplier * freshnessBoost
      
      return {
        ...recording,
        // Remove the detailed engagement arrays from response
        likes: undefined,
        comments: undefined,
        plays: undefined,
        // Add calculated metrics
        trendingScore,
        recentLikes,
        recentComments,
        recentPlays,
        completedPlays,
        completionRate: recentPlays > 0 ? (completedPlays / recentPlays) * 100 : 0,
        velocityMultiplier,
        timeDecay,
        engagementScore: baseScore
      }
    })

    // Sort by trending score (highest first) and take top 20
    const topTrending = trendingRecordings
      .filter(recording => recording.trendingScore > 0) // Only include recordings with some engagement
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 20)

    return NextResponse.json({ 
      recordings: topTrending,
      algorithm: {
        description: "Trending Score = (Likes × 3 + Comments × 2 + Plays × 1) × Time Decay × Velocity Multiplier × Freshness Boost",
        timeWindow: "7 days",
        maxResults: 20
      }
    })

  } catch (error) {
    console.error('Error fetching trending recordings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending recordings' },
      { status: 500 }
    )
  }
} 