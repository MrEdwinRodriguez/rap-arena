"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, Music, X, Plus } from "lucide-react"

export function BeatUploader() {
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const genres = ["Trap", "Boom Bap", "Drill", "Lo-Fi", "Jazz Rap", "Experimental", "R&B", "Pop Rap"]
  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const modes = ["Major", "Minor"]
  const moods = ["Dark", "Uplifting", "Chill", "Aggressive", "Nostalgic", "Atmospheric", "Energetic", "Melancholic"]

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setBeatFile(file)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith("audio/")) {
      setBeatFile(file)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!beatFile || !title || !genre || !bpm) return

    setIsUploading(true)

    // Simulate upload process
    setTimeout(() => {
      console.log("Beat uploaded:", {
        file: beatFile,
        title,
        description,
        genre,
        bpm,
        key,
        mood,
        tags,
      })

      // Reset form
      setBeatFile(null)
      setTitle("")
      setDescription("")
      setGenre("")
      setBpm("")
      setKey("")
      setMood("")
      setTags([])
      setIsUploading(false)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }, 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl flex items-center gap-2">
            <Music className="h-6 w-6 text-primary" />
            Upload Your Beat
          </CardTitle>
          <p className="text-muted-foreground">
            Share your beats with the RapArena community and let artists create magic over your production
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Beat File *</Label>
              <div
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                {beatFile ? (
                  <div className="space-y-2">
                    <Music className="h-12 w-12 text-primary mx-auto" />
                    <div>
                      <p className="font-semibold">{beatFile.name}</p>
                      <p className="text-sm text-muted-foreground">{formatFileSize(beatFile.size)}</p>
                    </div>
                    <Button
                      type="button"
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
                      <p className="font-semibold">Drop your beat here or click to browse</p>
                      <p className="text-sm text-muted-foreground">Supports MP3, WAV, FLAC (Max 50MB)</p>
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileSelect} className="hidden" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Beat Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter beat title"
                    required
                  />
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

                <div className="space-y-2">
                  <Label>Genre *</Label>
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

              {/* Technical Info */}
              <div className="space-y-4">
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Key</Label>
                    <Select value={key} onValueChange={setKey}>
                      <SelectTrigger>
                        <SelectValue placeholder="Key" />
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
                    <Label>Mode</Label>
                    <Select
                      value={key.includes("Major") ? "Major" : key.includes("Minor") ? "Minor" : ""}
                      onValueChange={(mode) => setKey(key.split(" ")[0] + " " + mode)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {modes.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {mode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Mood</Label>
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
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (Max 5)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  disabled={tags.length >= 5}
                />
                <Button type="button" variant="outline" onClick={addTag} disabled={!newTag.trim() || tags.length >= 5}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => {
                  setBeatFile(null)
                  setTitle("")
                  setDescription("")
                  setGenre("")
                  setBpm("")
                  setKey("")
                  setMood("")
                  setTags([])
                  if (fileInputRef.current) fileInputRef.current.value = ""
                }}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={!beatFile || !title || !genre || !bpm || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload Beat"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
