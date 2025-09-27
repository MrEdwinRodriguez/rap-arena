import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Like API called for recording:', params.id)
    
    const session = await getServerSession(authOptions)
    console.log('Session user:', session?.user?.id)

    if (!session?.user?.id) {
      console.log('No valid session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordingId = params.id
    console.log('Recording ID:', recordingId)

    // Check if recording exists
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId }
    })

    if (!recording) {
      console.log('Recording not found:', recordingId)
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    console.log('Recording found:', recording.title)

    // Check if user already liked this recording
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_recordingId: {
          userId: session.user.id,
          recordingId: recordingId
        }
      }
    })

    console.log('Existing like:', existingLike ? 'found' : 'not found')

    if (existingLike) {
      // Unlike - remove the like
      console.log('Removing like...')
      await prisma.like.delete({
        where: {
          userId_recordingId: {
            userId: session.user.id,
            recordingId: recordingId
          }
        }
      })

      // Update likes count
      console.log('Updating likes count (decrement)...')
      const updatedRecording = await prisma.recording.update({
        where: { id: recordingId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      console.log('Like removed successfully, new count:', updatedRecording.likesCount)
      return NextResponse.json({
        message: 'Recording unliked',
        liked: false,
        likesCount: updatedRecording.likesCount
      })
    } else {
      // Like - add the like
      console.log('Adding like...')
      await prisma.like.create({
        data: {
          userId: session.user.id,
          recordingId: recordingId
        }
      })

      // Update likes count
      console.log('Updating likes count (increment)...')
      const updatedRecording = await prisma.recording.update({
        where: { id: recordingId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      console.log('Like added successfully, new count:', updatedRecording.likesCount)
      return NextResponse.json({
        message: 'Recording liked',
        liked: true,
        likesCount: updatedRecording.likesCount
      })
    }

  } catch (error) {
    console.error('Detailed error in like toggle:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: 'Failed to toggle like', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 