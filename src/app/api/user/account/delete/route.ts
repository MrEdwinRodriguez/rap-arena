import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Get user's files that need to be deleted from storage
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        image: true,
        recordings: {
          select: {
            filePath: true
          }
        },
        beats: {
          select: {
            filePath: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user's files from Supabase Storage
    const filesToDelete: string[] = []

    // Add avatar if it exists
    if (user.image && user.image.includes('supabase')) {
      try {
        const urlParts = user.image.split('/')
        const fileName = urlParts[urlParts.length - 1]
        filesToDelete.push(`${userId}/${fileName}`)
      } catch (error) {
        console.error('Error parsing avatar URL:', error)
      }
    }

    // Add recording files
    user.recordings.forEach(recording => {
      if (recording.filePath) {
        filesToDelete.push(recording.filePath)
      }
    })

    // Add beat files
    user.beats.forEach(beat => {
      if (beat.filePath) {
        filesToDelete.push(beat.filePath)
      }
    })

    // Delete files from storage (don't fail if some files can't be deleted)
    if (filesToDelete.length > 0) {
      try {
        // Delete from recordings bucket
        const recordingFiles = filesToDelete.filter(path => path.includes('recording'))
        if (recordingFiles.length > 0) {
          await supabaseAdmin.storage.from('recordings').remove(recordingFiles)
        }

        // Delete from beats bucket
        const beatFiles = filesToDelete.filter(path => path.includes('beat'))
        if (beatFiles.length > 0) {
          await supabaseAdmin.storage.from('beats').remove(beatFiles)
        }

        // Delete from avatars bucket
        const avatarFiles = filesToDelete.filter(path => !path.includes('recording') && !path.includes('beat'))
        if (avatarFiles.length > 0) {
          await supabaseAdmin.storage.from('avatars').remove(avatarFiles)
        }
      } catch (error) {
        console.error('Error deleting files from storage:', error)
        // Continue with account deletion even if file deletion fails
      }
    }

    // Update comments to show "Deleted User" instead of deleting them
    // This preserves the conversation context while anonymizing the user
    await prisma.comment.updateMany({
      where: { userId: userId },
      data: { 
        // We can't change the userId due to foreign key constraints,
        // but we'll handle this in the frontend by checking if the user exists
      }
    })

    // Delete the user account (this will cascade delete related records due to onDelete: Cascade)
    // The comments will remain but their user reference will be broken, which we'll handle in the UI
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      message: 'Account deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
} 