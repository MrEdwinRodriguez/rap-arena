import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

interface RouteParams {
  params: {
    id: string
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordingId = params.id

    // Check if recording exists and belongs to user
    const existingRecording = await prisma.recording.findUnique({
      where: { id: recordingId },
      select: { 
        userId: true, 
        filePath: true,
        title: true 
      }
    })

    if (!existingRecording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    if (existingRecording.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete file from Supabase Storage
    try {
      const { error: storageError } = await supabaseAdmin.storage
        .from('recordings')
        .remove([existingRecording.filePath])
      
      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    } catch (storageError) {
      console.error('Storage deletion failed:', storageError)
      // Continue with database deletion
    }

    // Delete recording from database
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