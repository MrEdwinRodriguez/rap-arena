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
    const { id } = await params

    // Check if beat exists
    const beat = await prisma.beat.findUnique({
      where: { id },
      select: {
        id: true,
        likesCount: true,
        commentsCount: true
      }
    })

    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
    }

    let isLiked = false
    if (session?.user?.id) {
      const like = await prisma.beatLike.findUnique({
        where: {
          userId_beatId: {
            userId: session.user.id,
            beatId: id
          }
        }
      })
      isLiked = !!like
    }

    return NextResponse.json({
      isLiked,
      likesCount: beat.likesCount,
      commentsCount: beat.commentsCount
    })
  } catch (error) {
    console.error('Error fetching beat like status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
