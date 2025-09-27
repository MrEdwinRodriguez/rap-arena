import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/recordings/[id]/comments - Get all comments for a recording
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const recordingId = params.id

    // Check if recording exists
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId }
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    // Get only top-level comments (no parent)
    const comments = await prisma.comment.findMany({
      where: { 
        recordingId,
        parentId: null  // Only top-level comments
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
        replies: {
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
          },
          orderBy: {
            createdAt: 'asc'  // Replies in chronological order
          }
        }
      },
      orderBy: {
        createdAt: 'desc'  // Comments in reverse chronological order
      }
    })

    return NextResponse.json({ comments })

  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/recordings/[id]/comments - Add a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordingId = params.id
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: 'Comment is too long (max 500 characters)' }, { status: 400 })
    }

    // Check if recording exists
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId }
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        recordingId: recordingId
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
      }
    })

    // Update comments count
    await prisma.recording.update({
      where: { id: recordingId },
      data: {
        commentsCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      message: 'Comment added successfully',
      comment
    })

  } catch (error) {
    console.error('Error adding comment:', error)
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    )
  }
} 