"use client"

import { useState, useRef, useEffect, createContext, useContext } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Mic, Square, Play, Pause, RotateCcw, Save, Trash2, Upload } from "lucide-react"

// Create context for refreshing recordings
const RecordingRefreshContext = createContext<(() => void) | null>(null)

export function RecordingStudio() {
  const { data: session } = useSession()
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  
  // Form fields for saving
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const MAX_RECORDING_TIME = 60 // 60 seconds
  const MIN_RECORDING_TIME = 20 // 20 seconds

  useEffect(() => {
    // Request microphone permission on component mount
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false))

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      setHasPermission(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const resetRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
    setIsPlaying(false)
    setUploadSuccess(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const saveRecording = () => {
    if (recordingTime < MIN_RECORDING_TIME) {
      alert(`Recording must be at least ${MIN_RECORDING_TIME} seconds long`)
      return
    }
    setShowSaveDialog(true)
  }

  const handleUpload = async () => {
    if (!audioBlob || !session?.user) {
      return
    }

    if (!title.trim()) {
      alert("Please enter a title for your recording")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      
      // Create a file from the blob
      const file = new File([audioBlob], `recording-${Date.now()}.webm`, { 
        type: audioBlob.type 
      })
      
      formData.append('file', file)
      formData.append('title', title.trim())
      formData.append('description', description.trim())

      const response = await fetch('/api/upload/recording', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      console.log('Recording uploaded:', result)
      
      setUploadSuccess(true)
      setShowSaveDialog(false)
      
      // Reset form
      setTitle("")
      setDescription("")
      
      // Trigger refresh of recordings list
      // This would be handled by a parent component or global state
      window.dispatchEvent(new CustomEvent('recordingUploaded'))
      
      // Show success message
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload recording')
    } finally {
      setIsUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (!session) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please sign in to use the recording studio.</p>
        </CardContent>
      </Card>
    )
  }

  if (hasPermission === false) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Microphone access is required to record. Please enable microphone permissions and refresh the page.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Recording Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {uploadSuccess && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">Recording uploaded successfully! 🎉</p>
            </div>
          )}

          {/* Recording Controls */}
          <div className="flex justify-center">
            {!isRecording && !audioBlob && (
              <Button
                size="lg"
                onClick={startRecording}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-20 h-20"
                disabled={hasPermission !== true}
              >
                <Mic className="h-8 w-8" />
              </Button>
            )}

            {isRecording && (
              <Button
                size="lg"
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full w-20 h-20 animate-pulse"
              >
                <Square className="h-8 w-8" />
              </Button>
            )}
          </div>

          {/* Recording Timer */}
          {(isRecording || audioBlob) && (
            <div className="text-center space-y-2">
              <div className="text-2xl font-mono font-bold">
                {formatTime(recordingTime)}
              </div>
              <Progress 
                value={(recordingTime / MAX_RECORDING_TIME) * 100} 
                className="w-full"
              />
              <div className="text-sm text-muted-foreground">
                Max duration: {formatTime(MAX_RECORDING_TIME)}
              </div>
            </div>
          )}

          {/* Playback Controls */}
          {audioBlob && (
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={isPlaying ? pauseRecording : playRecording}
                className="flex items-center gap-2"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              
              <Button
                variant="outline"
                onClick={resetRecording}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
              
              <Button
                onClick={saveRecording}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                Save Recording
              </Button>
            </div>
          )}

          {/* Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}

          {/* Quality Guidelines */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Recording Tips:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Find a quiet environment with minimal background noise</li>
              <li>• Speak clearly and maintain consistent volume</li>
              <li>• Minimum recording length: {MIN_RECORDING_TIME} seconds</li>
              <li>• Maximum recording length: {MAX_RECORDING_TIME} seconds</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Save Recording Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Your Recording</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your recording"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description or lyrics"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || !title.trim()}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Save Recording
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
