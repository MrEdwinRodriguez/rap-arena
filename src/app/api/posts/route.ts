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

    const { content, type = 'text', recordingId } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Post is too long (max 1000 characters)' }, { status: 400 })
    }

    // If recordingId is provided, verify it exists and belongs to the user
    if (recordingId) {
      const recording = await prisma.recording.findUnique({
        where: { id: recordingId },
        select: { id: true, userId: true, title: true }
      })

      if (!recording) {
        return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
      }

      if (recording.userId !== session.user.id) {
        return NextResponse.json({ error: 'Cannot share someone else\'s recording' }, { status: 403 })
      }
    }

    // Create the post
    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        type,
        recordingId: recordingId || null
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
        recording: recordingId ? {
          select: {
            id: true,
            title: true
          }
        } : false
      }
    })

    return NextResponse.json({
      message: 'Post created successfully',
      post
    })

  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
} 