import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commentId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if comment exists
    const comment = await prisma.postComment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    // Check if user already liked this comment
    const existingLike = await prisma.postCommentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: commentId
        }
      }
    })

    if (existingLike) {
      // Unlike - remove the like
      await prisma.postCommentLike.delete({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId: commentId
          }
        }
      })

      // Update likes count
      const updatedComment = await prisma.postComment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({
        message: 'Comment unliked',
        liked: false,
        likesCount: updatedComment.likesCount
      })
    } else {
      // Like - add the like
      await prisma.postCommentLike.create({
        data: {
          userId: session.user.id,
          commentId: commentId
        }
      })

      // Update likes count
      const updatedComment = await prisma.postComment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        message: 'Comment liked',
        liked: true,
        likesCount: updatedComment.likesCount
      })
    }

  } catch (error) {
    console.error('Error toggling post comment like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle comment like' },
      { status: 500 }
    )
  }
} 