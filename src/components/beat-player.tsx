"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

interface Beat {
  id: string
  title: string
  duration: number
  audioUrl: string
  waveformData: number[]
}

interface BeatPlayerProps {
  beat: Beat
  isPlaying: boolean
  onPlayToggle: () => void
}

export function BeatPlayer({ beat, isPlaying, onPlayToggle }: BeatPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlayToggle = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
    }
    onPlayToggle()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center gap-3 mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlayToggle}
          className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        </Button>
        <div className="text-sm text-muted-foreground">{formatTime(beat.duration)}</div>
      </div>

      {/* Simple waveform visualization */}
      <div className="flex items-end gap-1 h-6">
        {beat.waveformData.map((height, index) => (
          <div
            key={index}
            className={`rounded-sm flex-1 transition-colors ${isPlaying ? "bg-primary" : "bg-primary/40"}`}
            style={{ height: `${height * 100}%` }}
          />
        ))}
      </div>

      <audio ref={audioRef} src={beat.audioUrl} onEnded={() => onPlayToggle()} className="hidden" />
    </div>
  )
}
