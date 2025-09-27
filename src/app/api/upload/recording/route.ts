import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

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
    const beatId = formData.get('beatId') as string
    const duration = formData.get('duration') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['audio/']
    if (!allowedTypes.some(type => file.type.startsWith(type))) {
      return NextResponse.json({ error: 'Invalid file type. Only audio files are allowed.' }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File size must be less than ${maxSize / (1024 * 1024)}MB` }, { status: 400 })
    }

    // Generate unique file name
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'webm'
    const fileName = `${session.user.id}/${timestamp}-${randomSuffix}.${extension}`
    
    // Upload to Supabase Storage using service role client
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('recordings')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('recordings')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

            // Save recording metadata to database
        const recording = await prisma.recording.create({
          data: {
            title,
            description,
            filePath: fileName,
            fileUrl: publicUrl,
            duration: duration ? parseInt(duration, 10) : null,
            fileSize: file.size,
            mimeType: file.type,
            userId: session.user.id,
            beatId: beatId || null,
          },
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
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Recording uploaded successfully',
      recording,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload recording' },
      { status: 500 }
    )
  }
} 