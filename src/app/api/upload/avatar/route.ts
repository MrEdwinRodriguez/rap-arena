import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

// Create server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Server-side image validation
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MIN_DIMENSION = 200
const MAX_DIMENSION = 1024

async function validateImageFile(file: File): Promise<{ isValid: boolean; error?: string }> {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum allowed is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, and WebP files are allowed'
    }
  }

  // Validate file signature (magic bytes)
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer.slice(0, 12))

  let isValidSignature = false

  // JPEG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    isValidSignature = true
  }
  // PNG
  else if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47 &&
    bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A && bytes[7] === 0x0A
  ) {
    isValidSignature = true
  }
  // WebP
  else if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    buffer.byteLength > 8
  ) {
    const webpBytes = new Uint8Array(buffer.slice(8, 12))
    if (String.fromCharCode(...webpBytes) === 'WEBP') {
      isValidSignature = true
    }
  }

  if (!isValidSignature) {
    return {
      isValid: false,
      error: 'Invalid file format or corrupted file'
    }
  }

  return { isValid: true }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate the image file
    const validation = await validateImageFile(file)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate unique file name
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `${session.user.id}/avatar-${timestamp}-${randomSuffix}.${extension}`

    // Delete old avatar if exists
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true }
    })

    if (currentUser?.image && currentUser.image.includes('supabase')) {
      try {
        // Extract file path from URL
        const urlParts = currentUser.image.split('/')
        const oldFileName = urlParts[urlParts.length - 1]
        const oldFilePath = `${session.user.id}/${oldFileName}`
        
        await supabaseAdmin.storage
          .from('avatars')
          .remove([oldFilePath])
      } catch (error) {
        console.log('Could not delete old avatar:', error)
        // Continue anyway
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    // Update user's avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: publicUrl
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      }
    })

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      user: updatedUser,
      avatarUrl: publicUrl
    })

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
} 