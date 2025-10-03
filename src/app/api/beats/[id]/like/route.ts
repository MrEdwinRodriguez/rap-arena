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

    const { id } = await params

    // Check if beat exists
    const beat = await prisma.beat.findUnique({
      where: { id }
    })

    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
    }

    // Check if user already liked this beat
    const existingLike = await prisma.beatLike.findUnique({
      where: {
        userId_beatId: {
          userId: session.user.id,
          beatId: id
        }
      }
    })

    if (existingLike) {
      // Unlike the beat
      await prisma.beatLike.delete({
        where: {
          userId_beatId: {
            userId: session.user.id,
            beatId: id
          }
        }
      })

      // Decrement likes count
      await prisma.beat.update({
        where: { id },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ 
        isLiked: false,
        likesCount: beat.likesCount - 1
      })
    } else {
      // Like the beat
      await prisma.beatLike.create({
        data: {
          userId: session.user.id,
          beatId: id
        }
      })

      // Increment likes count
      await prisma.beat.update({
        where: { id },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      return NextResponse.json({ 
        isLiked: true,
        likesCount: beat.likesCount + 1
      })
    }
  } catch (error) {
    console.error('Error toggling beat like:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
