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

    // Check if already favorited
    const existingFavorite = await prisma.favoritePost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favoritePost.delete({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId: postId
          }
        }
      })

      return NextResponse.json({
        message: 'Removed from favorites',
        isFavorited: false
      })
    } else {
      // Add to favorites
      await prisma.favoritePost.create({
        data: {
          userId: session.user.id,
          postId: postId
        }
      })

      return NextResponse.json({
        message: 'Added to favorites',
        isFavorited: true
      })
    }

  } catch (error) {
    console.error('Error toggling post favorite:', error)
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}

// GET /api/posts/[id]/favorite - Check if post is favorited
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: postId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false })
    }

    const favorite = await prisma.favoritePost.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId: postId
        }
      }
    })

    return NextResponse.json({
      isFavorited: !!favorite
    })

  } catch (error) {
    console.error('Error checking post favorite status:', error)
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    )
  }
} 