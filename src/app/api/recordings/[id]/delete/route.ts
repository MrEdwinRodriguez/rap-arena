import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: recordingId } = await params

    // Check if recording exists and belongs to the user
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      select: { id: true, userId: true, filePath: true }
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    if (recording.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this recording' }, { status: 403 })
    }

    // Delete the file from Supabase storage
    if (recording.filePath) {
      const { error: storageError } = await supabase.storage
        .from('recordings')
        .remove([recording.filePath])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the recording (cascade will handle comments, likes, plays, notifications)
    await prisma.recording.delete({
      where: { id: recordingId }
    })

    return NextResponse.json({
      message: 'Recording deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting recording:', error)
    return NextResponse.json(
      { error: 'Failed to delete recording' },
      { status: 500 }
    )
  }
} 