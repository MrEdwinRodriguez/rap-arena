import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Storage bucket names
export const STORAGE_BUCKETS = {
  RECORDINGS: 'recordings',
  BEATS: 'beats', 
  AVATARS: 'avatars'
} as const

// Storage helper functions
export const storageHelpers = {
  // Upload file to a specific bucket
  uploadFile: async (
    bucket: string,
    filePath: string,
    file: File | Blob,
    options?: { cacheControl?: string; upsert?: boolean }
  ) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false
      })
    
    if (error) {
      console.error('Upload error:', error)
      throw error
    }
    
    return data
  },

  // Get public URL for a file
  getPublicUrl: (bucket: string, filePath: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)
    
    return data.publicUrl
  },

  // Delete file from bucket
  deleteFile: async (bucket: string, filePath: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    
    if (error) {
      console.error('Delete error:', error)
      throw error
    }
  },

  // Generate unique file name
  generateFileName: (originalName: string, userId: string) => {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const extension = originalName.split('.').pop()
    return `${userId}/${timestamp}-${randomSuffix}.${extension}`
  },

  // Get file size limit for different types
  getFileSizeLimit: (type: 'recording' | 'beat' | 'avatar') => {
    const limits = {
      recording: 10 * 1024 * 1024, // 10MB
      beat: 20 * 1024 * 1024,      // 20MB
      avatar: 2 * 1024 * 1024       // 2MB
    }
    return limits[type]
  },

  // Validate file type
  validateFileType: (file: File, allowedTypes: string[]) => {
    return allowedTypes.some(type => file.type.startsWith(type))
  }
} 