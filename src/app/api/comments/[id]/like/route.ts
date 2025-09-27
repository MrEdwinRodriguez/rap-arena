import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Comment like API called for comment:', params.id)
    
    const session = await getServerSession(authOptions)
    console.log('Session user:', session?.user?.id)

    if (!session?.user?.id) {
      console.log('No valid session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const commentId = params.id
    console.log('Comment ID:', commentId)

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    })

    if (!comment) {
      console.log('Comment not found:', commentId)
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    console.log('Comment found, content:', comment.content.substring(0, 50) + '...')

    // Check if user already liked this comment
    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: session.user.id,
          commentId: commentId
        }
      }
    })

    console.log('Existing comment like:', existingLike ? 'found' : 'not found')

    if (existingLike) {
      // Unlike - remove the like
      console.log('Removing comment like...')
      await prisma.commentLike.delete({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId: commentId
          }
        }
      })

      // Update likes count
      console.log('Updating comment likes count (decrement)...')
      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      console.log('Comment like removed successfully, new count:', updatedComment.likesCount)
      return NextResponse.json({
        message: 'Comment unliked',
        liked: false,
        likesCount: updatedComment.likesCount
      })
    } else {
      // Like - add the like
      console.log('Adding comment like...')
      await prisma.commentLike.create({
        data: {
          userId: session.user.id,
          commentId: commentId
        }
      })

      // Update likes count
      console.log('Updating comment likes count (increment)...')
      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      console.log('Comment like added successfully, new count:', updatedComment.likesCount)
      return NextResponse.json({
        message: 'Comment liked',
        liked: true,
        likesCount: updatedComment.likesCount
      })
    }

  } catch (error) {
    console.error('Detailed error in comment like toggle:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to toggle comment like', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 