import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: parentCommentId } = await params
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Reply is too long (max 500 characters)' }, { status: 400 })
    }

    // Check if parent comment exists
    const parentComment = await prisma.comment.findUnique({
      where: { id: parentCommentId },
      include: { recording: true }
    })

    if (!parentComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Create the reply
    const reply = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        recordingId: parentComment.recordingId,
        parentId: parentCommentId
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
        parent: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                username: true
              }
            }
          }
        }
      }
    })

    // Update the recording's comments count
    await prisma.recording.update({
      where: { id: parentComment.recordingId },
      data: {
        commentsCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      message: 'Reply added successfully',
      reply
    })

  } catch (error) {
    console.error('Error adding reply:', error)
    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    )
  }
} 