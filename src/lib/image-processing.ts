// Image processing utilities for profile picture uploads

export interface ImageValidationResult {
  isValid: boolean
  error?: string
  metadata?: {
    width: number
    height: number
    size: number
    type: string
  }
}

export interface ProcessedImage {
  blob: Blob
  width: number
  height: number
  size: number
  type: string
}

// Allowed image types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
] as const

// Image constraints
export const IMAGE_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_DIMENSION: 200, // 200x200 minimum
  MAX_DIMENSION: 1024, // 1024x1024 maximum
  QUALITY: 0.85, // JPEG quality
  TARGET_SIZE: 512 // Target profile image size
} as const

// Validate file before processing
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  // Check file size
  if (file.size > IMAGE_CONSTRAINTS.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum allowed is ${IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, WebP, and HEIC files are allowed'
    }
  }

  // Validate file signature (magic bytes)
  return await validateFileSignature(file)
}

// Validate file signature to prevent malicious files
async function validateFileSignature(file: File): Promise<ImageValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer
      const bytes = new Uint8Array(buffer.slice(0, 12)) // Read first 12 bytes
      
      // Check magic bytes for different image formats
      const signatures = {
        jpeg: [0xFF, 0xD8, 0xFF],
        png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
        webp: [0x52, 0x49, 0x46, 0x46], // "RIFF"
        heic: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70] // ftyp
      }

      let isValidSignature = false

      // JPEG
      if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
        isValidSignature = true
      }
      // PNG
      else if (bytes.slice(0, 8).every((byte, i) => byte === signatures.png[i])) {
        isValidSignature = true
      }
      // WebP (check for RIFF and WEBP)
      else if (
        bytes.slice(0, 4).every((byte, i) => byte === signatures.webp[i]) &&
        buffer.byteLength > 8
      ) {
        const webpBytes = new Uint8Array(buffer.slice(8, 12))
        if (String.fromCharCode(...webpBytes) === 'WEBP') {
          isValidSignature = true
        }
      }
      // HEIC/HEIF
      else if (buffer.byteLength > 12) {
        const heicBytes = new Uint8Array(buffer.slice(4, 12))
        const heicString = String.fromCharCode(...heicBytes)
        if (heicString === 'ftypheic' || heicString === 'ftypheif') {
          isValidSignature = true
        }
      }

      if (!isValidSignature) {
        resolve({
          isValid: false,
          error: 'Invalid file format or corrupted file'
        })
      } else {
        resolve({ isValid: true })
      }
    }

    reader.onerror = () => {
      resolve({
        isValid: false,
        error: 'Unable to read file'
      })
    }

    reader.readAsArrayBuffer(file.slice(0, 12))
  })
}

// Process and compress image
export async function processImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    img.onload = () => {
      const { width: originalWidth, height: originalHeight } = img

      // Check minimum dimensions
      if (originalWidth < IMAGE_CONSTRAINTS.MIN_DIMENSION || originalHeight < IMAGE_CONSTRAINTS.MIN_DIMENSION) {
        reject(new Error(`Image too small. Minimum size is ${IMAGE_CONSTRAINTS.MIN_DIMENSION}x${IMAGE_CONSTRAINTS.MIN_DIMENSION}px`))
        return
      }

      // Calculate new dimensions (maintain aspect ratio, fit within max bounds)
      const size = Math.min(
        IMAGE_CONSTRAINTS.TARGET_SIZE,
        Math.min(originalWidth, originalHeight)
      )

      // For profile pictures, we'll use square cropping
      canvas.width = size
      canvas.height = size

      // Calculate crop area (center crop)
      const minDimension = Math.min(originalWidth, originalHeight)
      const cropX = (originalWidth - minDimension) / 2
      const cropY = (originalHeight - minDimension) / 2

      // Clear canvas with white background (for transparent images)
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, size, size)

      // Draw and crop image
      ctx.drawImage(
        img,
        cropX, cropY, minDimension, minDimension, // Source rectangle (square crop)
        0, 0, size, size // Destination rectangle
      )

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to process image'))
            return
          }

          resolve({
            blob,
            width: size,
            height: size,
            size: blob.size,
            type: 'image/jpeg' // Always output as JPEG
          })
        },
        'image/jpeg',
        IMAGE_CONSTRAINTS.QUALITY
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Create object URL for the image
    img.src = URL.createObjectURL(file)
  })
}

// Strip EXIF data (this happens automatically when we redraw on canvas)
export function stripExifData(file: File): Promise<Blob> {
  return processImage(file).then(processed => processed.blob)
}

// Basic content moderation checks (client-side)
export async function performBasicContentCheck(file: File): Promise<{ safe: boolean; reason?: string }> {
  // This is a basic implementation - for production, you'd want to use
  // services like AWS Rekognition, Google Vision API, or Azure Computer Vision
  
  // For now, we'll just check file properties and return safe
  // In a real implementation, you would:
  // 1. Send image to moderation service
  // 2. Check for explicit content, violence, hate symbols
  // 3. Return detailed analysis

  try {
    const validation = await validateImageFile(file)
    if (!validation.isValid) {
      return { safe: false, reason: validation.error }
    }

    // Placeholder for actual content moderation
    // TODO: Integrate with content moderation service
    return { safe: true }
  } catch (error) {
    return { safe: false, reason: 'Unable to analyze image content' }
  }
}

// Generate preview URL
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file)
}

// Clean up preview URL
export function revokeImagePreview(url: string): void {
  URL.revokeObjectURL(url)
}

// Convert HEIC to JPEG (requires heic2any library)
export async function convertHeicToJpeg(file: File): Promise<File> {
  if (!file.type.includes('heic') && !file.type.includes('heif')) {
    return file
  }

  try {
    // This would require the heic2any library
    // npm install heic2any
    // const heic2any = (await import('heic2any')).default
    // const convertedBlob = await heic2any({
    //   blob: file,
    //   toType: 'image/jpeg',
    //   quality: IMAGE_CONSTRAINTS.QUALITY
    // }) as Blob
    
    // For now, we'll process HEIC files through our normal pipeline
    const processed = await processImage(file)
    return new File([processed.blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
      type: 'image/jpeg'
    })
  } catch (error) {
    throw new Error('Unable to convert HEIC image. Please use JPEG or PNG format.')
  }
} 