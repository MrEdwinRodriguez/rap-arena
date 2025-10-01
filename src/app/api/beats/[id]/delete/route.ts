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

    const { id: beatId } = await params

    // Check if beat exists and belongs to the user
    const beat = await prisma.beat.findUnique({
      where: { id: beatId },
      select: { id: true, userId: true, filePath: true }
    })

    if (!beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 })
    }

    if (beat.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this beat' }, { status: 403 })
    }

    // Delete the file from Supabase storage
    if (beat.filePath) {
      const { error: storageError } = await supabase.storage
        .from('beats')
        .remove([beat.filePath])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete the beat (cascade will handle notifications)
    await prisma.beat.delete({
      where: { id: beatId }
    })

    return NextResponse.json({
      message: 'Beat deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting beat:', error)
    return NextResponse.json(
      { error: 'Failed to delete beat' },
      { status: 500 }
    )
  }
} 