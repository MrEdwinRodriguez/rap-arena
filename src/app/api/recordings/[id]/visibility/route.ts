import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isPublic } = await request.json()
    const recordingId = params.id

    // Check if recording exists and belongs to user
    const existingRecording = await prisma.recording.findUnique({
      where: { id: recordingId },
      select: { userId: true }
    })

    if (!existingRecording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    if (existingRecording.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update recording visibility
    const updatedRecording = await prisma.recording.update({
      where: { id: recordingId },
      data: { isPublic },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        },
        beat: {
          select: {
            id: true,
            title: true,
            genre: true,
            bpm: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Recording visibility updated',
      recording: updatedRecording
    })

  } catch (error) {
    console.error('Error updating recording visibility:', error)
    return NextResponse.json(
      { error: 'Failed to update recording visibility' },
      { status: 500 }
    )
  }
} 