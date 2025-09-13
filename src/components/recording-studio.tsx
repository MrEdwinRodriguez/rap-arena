"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Mic, Square, Play, Pause, RotateCcw, Save, Trash2 } from "lucide-react"

export function RecordingStudio() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

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
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const saveRecording = () => {
    if (audioBlob && recordingTime >= MIN_RECORDING_TIME) {
      // Here you would typically upload to your backend
      console.log("Saving recording:", audioBlob)
      // For now, just reset
      resetRecording()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getRecordingStatus = () => {
    if (recordingTime < MIN_RECORDING_TIME) return "Keep going..."
    if (recordingTime >= MAX_RECORDING_TIME) return "Max time reached"
    return "Looking good!"
  }

  const getStatusColor = () => {
    if (recordingTime < MIN_RECORDING_TIME) return "bg-yellow-500"
    if (recordingTime >= MAX_RECORDING_TIME) return "bg-red-500"
    return "bg-green-500"
  }

  if (hasPermission === false) {
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Microphone Access Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                To record your raps, we need access to your microphone. Please enable microphone permissions and refresh
                the page.
              </p>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif font-bold mb-4">Recording Studio</h2>
          <p className="text-xl text-muted-foreground">Drop your bars in 20-60 seconds. Make every second count.</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Badge variant="outline" className="text-sm">
                {formatTime(recordingTime)} / {formatTime(MAX_RECORDING_TIME)}
              </Badge>
              {recordingTime > 0 && <Badge className={`${getStatusColor()} text-white`}>{getRecordingStatus()}</Badge>}
            </div>
            <Progress value={(recordingTime / MAX_RECORDING_TIME) * 100} className="w-full h-2" />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Recording Controls */}
            <div className="flex justify-center">
              {!isRecording && !audioBlob && (
                <Button
                  size="lg"
                  onClick={startRecording}
                  className="w-24 h-24 rounded-full bg-primary hover:bg-primary/90 text-white"
                  disabled={hasPermission !== true}
                >
                  <Mic className="h-8 w-8" />
                </Button>
              )}

              {isRecording && (
                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 text-white animate-pulse"
                >
                  <Square className="h-8 w-8" />
                </Button>
              )}
            </div>

            {/* Playback Controls */}
            {audioBlob && (
              <div className="space-y-4">
                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={isPlaying ? pauseRecording : playRecording}
                    className="bg-transparent"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>
                  <Button variant="outline" size="lg" onClick={resetRecording} className="bg-transparent">
                    <RotateCcw className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={resetRecording}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Discard
                  </Button>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={saveRecording}
                    disabled={recordingTime < MIN_RECORDING_TIME}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Recording
                  </Button>
                </div>

                {recordingTime < MIN_RECORDING_TIME && (
                  <p className="text-sm text-yellow-600 text-center">
                    Recording must be at least {MIN_RECORDING_TIME} seconds to save
                  </p>
                )}
              </div>
            )}

            {/* Hidden audio element for playback */}
            {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}
          </CardContent>
        </Card>

        {/* Recording Tips */}
        <div className="mt-8 max-w-2xl mx-auto">
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <h3 className="font-serif font-bold mb-3">Recording Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Find a quiet space with minimal background noise</li>
                <li>• Speak clearly and project your voice</li>
                <li>• Keep your recording between 20-60 seconds</li>
                <li>• Make every bar count - quality over quantity</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
