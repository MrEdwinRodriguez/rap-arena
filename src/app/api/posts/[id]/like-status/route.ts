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
    const { id: postId } = await params

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        likesCount: true,
        commentsCount: true
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    let isLiked = false

    // Check if user is logged in and has liked this post
    if (session?.user?.id) {
      const like = await prisma.postLike.findUnique({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId
          }
        }
      })
      isLiked = !!like
    }

    return NextResponse.json({
      isLiked,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount
    })

  } catch (error) {
    console.error('Error fetching post like status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch like status' },
      { status: 500 }
    )
  }
} 