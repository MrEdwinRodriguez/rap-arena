import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: recordingId } = await params

    // Check if recording exists
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      select: {
        id: true,
        likesCount: true,
        commentsCount: true
      }
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    let isLiked = false

    // Check if user is logged in and has liked this recording
    if (session?.user?.id) {
      const like = await prisma.like.findUnique({
        where: {
          userId_recordingId: {
            userId: session.user.id,
            recordingId: recordingId
          }
        }
      })
      isLiked = !!like
    }

    return NextResponse.json({
      isLiked,
      likesCount: recording.likesCount,
      commentsCount: recording.commentsCount
    })

  } catch (error) {
    console.error('Error fetching like status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch like status' },
      { status: 500 }
    )
  }
} 