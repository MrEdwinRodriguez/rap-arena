import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storageHelpers, STORAGE_BUCKETS } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const genre = formData.get('genre') as string
    const bpm = formData.get('bpm') as string
    const key = formData.get('key') as string
    const mood = formData.get('mood') as string
    const tagsString = formData.get('tags') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['audio/']
    if (!storageHelpers.validateFileType(file, allowedTypes)) {
      return NextResponse.json({ error: 'Invalid file type. Only audio files are allowed.' }, { status: 400 })
    }

    // Validate file size (20MB limit)
    const maxSize = storageHelpers.getFileSizeLimit('beat')
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File size must be less than ${maxSize / (1024 * 1024)}MB` }, { status: 400 })
    }

    // Parse tags
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    // Generate unique file name
    const fileName = storageHelpers.generateFileName(file.name, session.user.id)
    
    // Upload to Supabase Storage
    const uploadResult = await storageHelpers.uploadFile(
      STORAGE_BUCKETS.BEATS,
      fileName,
      file
    )

    // Get public URL
    const publicUrl = storageHelpers.getPublicUrl(STORAGE_BUCKETS.BEATS, fileName)

    // Save beat metadata to database
    const beat = await prisma.beat.create({
      data: {
        title,
        description,
        filePath: fileName,
        fileUrl: publicUrl,
        genre,
        bpm: bpm ? parseInt(bpm) : null,
        key,
        mood,
        tags,
        fileSize: file.size,
        mimeType: file.type,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Beat uploaded successfully',
      beat,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload beat' },
      { status: 500 }
    )
  }
} 