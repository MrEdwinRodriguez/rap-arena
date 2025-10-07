"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Square, Play, Pause, RotateCcw, Send, Clock, Zap } from "lucide-react"

interface FreestyleRecorderProps {
  challenge: {
    id: string
    title: string
    topic: string
    timeLimit: number
    isRandom?: boolean
  }
  onClose: () => void
}

export function FreestyleRecorder({ challenge, onClose }: FreestyleRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [preparationTime, setPreparationTime] = useState(10)
  const [phase, setPhase] = useState<"prepare" | "record" | "review">("prepare")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Start preparation countdown
    if (phase === "prepare") {
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      intervalRef.current = setInterval(() => {
        setPreparationTime((prev) => {
          if (prev <= 1) {
            // Clear the preparation interval before transitioning
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setPhase("record")
            startRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const startRecording = useCallback(async () => {
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
        setPhase("review")
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Clear any existing interval before starting new one
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Start recording timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= challenge.timeLimit) {
            stopRecording()
            return prev
          }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
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
    setPhase("prepare")
    setPreparationTime(10)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const submitRecording = () => {
    if (audioBlob) {
      console.log("Submitting freestyle recording:", audioBlob)
      // Here you would upload to backend
      onClose()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{challenge.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Challenge Topic */}
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2 flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-secondary" />
                Your Topic:
              </h3>
              <div className="text-2xl font-serif font-bold text-primary">{challenge.topic}</div>
            </CardContent>
          </Card>

          {/* Phase: Preparation */}
          {phase === "prepare" && (
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Get Ready!</h3>
              <div className="text-6xl font-bold text-primary">{preparationTime}</div>
              <p className="text-muted-foreground">Think about your bars... Recording starts automatically!</p>
              <Progress value={((10 - preparationTime) / 10) * 100} className="w-full h-2" />
            </div>
          )}

          {/* Phase: Recording */}
          {phase === "record" && (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Badge variant="outline" className="text-lg px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(recordingTime)} / {formatTime(challenge.timeLimit)}
                </Badge>
                <Badge className="bg-red-500 text-white animate-pulse">RECORDING</Badge>
              </div>

              <Progress value={(recordingTime / challenge.timeLimit) * 100} className="w-full h-3" />

              <div className="flex justify-center">
                <Button
                  size="lg"
                  onClick={stopRecording}
                  className="w-24 h-24 rounded-full bg-red-500 hover:bg-red-600 text-white animate-pulse"
                >
                  <Square className="h-8 w-8" />
                </Button>
              </div>

              <p className="text-muted-foreground">Spit your bars! Click to stop early or wait for auto-stop.</p>
            </div>
          )}

          {/* Phase: Review */}
          {phase === "review" && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Review Your Freestyle</h3>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  Final Time: {formatTime(recordingTime)}
                </Badge>
              </div>

              {/* Playback Controls */}
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

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={submitRecording}>
                  <Send className="h-4 w-4 mr-2" />
                  {challenge.isRandom ? "Save Freestyle" : "Submit Entry"}
                </Button>
              </div>

              {!challenge.isRandom && (
                <p className="text-sm text-center text-muted-foreground">
                  Your entry will be judged by the community. Good luck!
                </p>
              )}
            </div>
          )}

          {/* Hidden audio element for playback */}
          {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
