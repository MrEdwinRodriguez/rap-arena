"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Music, X, Plus, CheckCircle } from "lucide-react"

export function BeatUploader() {
  const { data: session } = useSession()
  const [beatFile, setBeatFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [genre, setGenre] = useState("")
  const [bpm, setBpm] = useState("")
  const [key, setKey] = useState("")
  const [mood, setMood] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const genres = ["Trap", "Boom Bap", "Drill", "Lo-Fi", "Jazz Rap", "Experimental", "R&B", "Pop Rap"]
  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const modes = ["Major", "Minor"]
  const moods = ["Dark", "Uplifting", "Chill", "Aggressive", "Nostalgic", "Atmospheric", "Energetic", "Melancholic"]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setBeatFile(file)
      setError("")
    } else if (file) {
      setError("Please select a valid audio file")
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith("audio/")) {
      setBeatFile(file)
      setError("")
    } else if (file) {
      setError("Please select a valid audio file")
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const resetForm = () => {
    setBeatFile(null)
    setTitle("")
    setDescription("")
    setGenre("")
    setBpm("")
    setKey("")
    setMood("")
    setTags([])
    setNewTag("")
    setError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!session?.user) {
      setError("Please sign in to upload beats")
      return
    }

    if (!beatFile || !title || !genre || !bpm) {
      setError("Please fill in all required fields")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append('file', beatFile)
      formData.append('title', title.trim())
      formData.append('description', description.trim())
      formData.append('genre', genre)
      formData.append('bpm', bpm)
      formData.append('key', key)
      formData.append('mood', mood)
      formData.append('tags', tags.join(','))

      const response = await fetch('/api/upload/beat', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      console.log('Beat uploaded:', result)
      
      setUploadSuccess(true)
      resetForm()
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false)
      }, 5000)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload beat')
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!session) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please sign in to upload beats.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {uploadSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 text-sm">Beat uploaded successfully! 🎵</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Upload Your Beat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>Beat File *</Label>
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {beatFile ? (
                <div className="space-y-2">
                  <Music className="h-12 w-12 text-primary mx-auto" />
                  <div>
                    <p className="font-medium">{beatFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(beatFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setBeatFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ""
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium">Drop your beat here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Supports: MP3, WAV, FLAC, AAC (max 20MB)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Beat title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Select value={genre} onValueChange={setGenre} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your beat, inspiration, or usage rights..."
              rows={3}
            />
          </div>

          {/* Technical Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bpm">BPM *</Label>
              <Input
                id="bpm"
                type="number"
                value={bpm}
                onChange={(e) => setBpm(e.target.value)}
                placeholder="120"
                min="60"
                max="200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="key">Key</Label>
              <Select value={key} onValueChange={setKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  {keys.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (optional)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag} disabled={!newTag.trim() || tags.length >= 10}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Add up to 10 tags to help people discover your beat
            </p>
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!beatFile || !title || !genre || !bpm || isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Beat
              </>
            )}
          </Button>

          {/* Upload Guidelines */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Upload Guidelines:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Only upload beats you own or have permission to share</li>
              <li>• High quality audio files (WAV/FLAC preferred)</li>
              <li>• Maximum file size: 20MB</li>
              <li>• Include accurate BPM and key information</li>
              <li>• Use clear, descriptive titles and tags</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
