"use client"

import { useState, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useUser } from "@/lib/user-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
// import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, X, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { 
  validateImageFile, 
  processImage, 
  createImagePreview, 
  revokeImagePreview, 
  performBasicContentCheck,
  IMAGE_CONSTRAINTS
} from "@/lib/image-processing"

interface AvatarUploaderProps {
  currentImage?: string
  userName?: string
  onUploadSuccess?: (avatarUrl: string) => void
  onUploadError?: (error: string) => void
}

interface UploadState {
  isUploading: boolean
  progress: number
  error: string | null
  success: boolean
}

export function AvatarUploader({ 
  currentImage, 
  userName, 
  onUploadSuccess, 
  onUploadError 
}: AvatarUploaderProps) {
  const { update } = useSession()
  const { updateUserImage } = useUser()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false
  })
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get user initials for fallback
  const getInitials = (name?: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadState({ isUploading: false, progress: 0, error: null, success: false })

    try {
      // Validate the file
      const validation = await validateImageFile(file)
      if (!validation.isValid) {
        setUploadState(prev => ({ ...prev, error: validation.error || "Invalid file" }))
        return
      }

      // Basic content moderation check
      const contentCheck = await performBasicContentCheck(file)
      if (!contentCheck.safe) {
        setUploadState(prev => ({ 
          ...prev, 
          error: contentCheck.reason || "Content not allowed"
        }))
        return
      }

      // Process and compress the image
      const processed = await processImage(file)
      
      // Create new file from processed blob
      const processedFile = new File([processed.blob], file.name, { 
        type: processed.type 
      })

      // Create preview
      const preview = createImagePreview(processedFile)
      setPreviewUrl(preview)
      setSelectedFile(processedFile)

    } catch (error) {
      console.error('File processing error:', error)
      setUploadState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to process image'
      }))
    }
  }, [])

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag and drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)

    const files = Array.from(event.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleFileSelect(imageFile)
    } else {
      setUploadState(prev => ({ 
        ...prev, 
        error: 'Please drop an image file'
      }))
    }
  }, [handleFileSelect])

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  // Upload the selected file
  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadState({ isUploading: true, progress: 0, error: null, success: false })

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 200)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      setUploadState({ 
        isUploading: false, 
        progress: 100, 
        error: null, 
        success: true 
      })

      // Clean up preview
      if (previewUrl) {
        revokeImagePreview(previewUrl)
        setPreviewUrl(null)
      }
      setSelectedFile(null)

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Update the user context immediately
      updateUserImage(result.avatarUrl)

      // Update the session with new avatar (background update)
      if (update) {
        update({
          image: result.avatarUrl
        }).catch(error => {
          console.error('Failed to update session:', error)
        })
      }

      // Call success callback
      onUploadSuccess?.(result.avatarUrl)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, success: false }))
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      
      setUploadState({ 
        isUploading: false, 
        progress: 0, 
        error: errorMessage, 
        success: false 
      })
      
      onUploadError?.(errorMessage)
    }
  }

  // Cancel preview
  const handleCancel = () => {
    if (previewUrl) {
      revokeImagePreview(previewUrl)
      setPreviewUrl(null)
    }
    setSelectedFile(null)
    setUploadState({ isUploading: false, progress: 0, error: null, success: false })
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Current/Preview Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={previewUrl || currentImage || ""} 
            alt={userName || "Profile"} 
          />
          <AvatarFallback className="text-lg">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">Profile Picture</h3>
          <p className="text-xs text-muted-foreground">
            {IMAGE_CONSTRAINTS.TARGET_SIZE}×{IMAGE_CONSTRAINTS.TARGET_SIZE}px recommended
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={openFileDialog}
            disabled={uploadState.isUploading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Choose Image
          </Button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag & Drop Area */}
      <Card 
        className={`border-2 border-dashed transition-colors ${
          isDragOver 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-1">
            Drag and drop an image here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, WebP, HEIC • Max {IMAGE_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB • 
            Min {IMAGE_CONSTRAINTS.MIN_DIMENSION}×{IMAGE_CONSTRAINTS.MIN_DIMENSION}px
          </p>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadState.isUploading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Processing and uploading...</span>
          </div>
          <Progress value={uploadState.progress} />
        </div>
      )}

      {/* Error Message */}
      {uploadState.error && (
        <div className="border border-red-200 bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{uploadState.error}</span>
        </div>
      )}

      {/* Success Message */}
      {uploadState.success && (
        <div className="border border-green-200 bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>Avatar uploaded successfully!</span>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && !uploadState.isUploading && (
        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={uploadState.isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Avatar
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

      {/* Image Guidelines */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Guidelines:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use clear, well-lit photos of yourself</li>
          <li>Square aspect ratio works best</li>
          <li>Avoid copyrighted images or logos</li>
          <li>Keep it appropriate - no explicit content</li>
          <li>Images are automatically resized and compressed</li>
        </ul>
      </div>
    </div>
  )
} 