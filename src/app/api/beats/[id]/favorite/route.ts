import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: beatId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if beat exists
    const beat = await prisma.beat.findUnique({
      where: { id: beatId }
    })

    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteBeat.findUnique({
      where: {
        userId_beatId: {
          userId: session.user.id,
          beatId: beatId
        }
      }
    })

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favoriteBeat.delete({
        where: {
          userId_beatId: {
            userId: session.user.id,
            beatId: beatId
          }
        }
      })

      return NextResponse.json({
        message: 'Removed from favorites',
        isFavorited: false
      })
    } else {
      // Add to favorites
      await prisma.favoriteBeat.create({
        data: {
          userId: session.user.id,
          beatId: beatId
        }
      })

      return NextResponse.json({
        message: 'Added to favorites',
        isFavorited: true
      })
    }

  } catch (error) {
    console.error('Error toggling beat favorite:', error)
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}

// GET /api/beats/[id]/favorite - Check if beat is favorited
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: beatId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false })
    }

    const favorite = await prisma.favoriteBeat.findUnique({
      where: {
        userId_beatId: {
          userId: session.user.id,
          beatId: beatId
        }
      }
    })

    return NextResponse.json({
      isFavorited: !!favorite
    })

  } catch (error) {
    console.error('Error checking beat favorite status:', error)
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    )
  }
} 