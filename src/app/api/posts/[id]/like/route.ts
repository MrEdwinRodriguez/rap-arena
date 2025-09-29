import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Check if user already liked this post
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    if (existingLike) {
      // Unlike - remove the like
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId
          }
        }
      })

      // Update likes count
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({
        message: 'Post unliked',
        liked: false,
        likesCount: updatedPost.likesCount
      })
    } else {
      // Like - add the like
      await prisma.postLike.create({
        data: {
          userId: session.user.id,
          postId: postId
        }
      })

      // Update likes count
      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      return NextResponse.json({
        message: 'Post liked',
        liked: true,
        likesCount: updatedPost.likesCount
      })
    }

  } catch (error) {
    console.error('Error toggling post like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
} 