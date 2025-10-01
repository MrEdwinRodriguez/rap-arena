import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: recordingId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if recording exists
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId }
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteRecording.findUnique({
      where: {
        userId_recordingId: {
          userId: session.user.id,
          recordingId: recordingId
        }
      }
    })

    if (existingFavorite) {
      // Remove from favorites
      await prisma.favoriteRecording.delete({
        where: {
          userId_recordingId: {
            userId: session.user.id,
            recordingId: recordingId
          }
        }
      })

      return NextResponse.json({
        message: 'Removed from favorites',
        isFavorited: false
      })
    } else {
      // Add to favorites
      await prisma.favoriteRecording.create({
        data: {
          userId: session.user.id,
          recordingId: recordingId
        }
      })

      return NextResponse.json({
        message: 'Added to favorites',
        isFavorited: true
      })
    }

  } catch (error) {
    console.error('Error toggling recording favorite:', error)
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    )
  }
}

// GET /api/recordings/[id]/favorite - Check if recording is favorited
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id: recordingId } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ isFavorited: false })
    }

    const favorite = await prisma.favoriteRecording.findUnique({
      where: {
        userId_recordingId: {
          userId: session.user.id,
          recordingId: recordingId
        }
      }
    })

    return NextResponse.json({
      isFavorited: !!favorite
    })

  } catch (error) {
    console.error('Error checking recording favorite status:', error)
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    )
  }
} 