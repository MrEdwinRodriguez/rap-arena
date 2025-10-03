"use client"

import { useRef, useEffect, useState } from 'react'
import { Play, Pause, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AudioPreviewPlayerProps {
  audioUrl: string
  title: string
  duration: number
  previewDuration?: number // in seconds, defaults to 60
  type: 'recording' | 'beat'
}

export function AudioPreviewPlayer({ 
  audioUrl, 
  title, 
  duration, 
  previewDuration = 60,
  type 
}: AudioPreviewPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPreviewComplete, setIsPreviewComplete] = useState(false)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return

    const current = audioRef.current.currentTime
    setCurrentTime(current)

    // Check if preview time limit reached
    if (current >= previewDuration && !isPreviewComplete) {
      audioRef.current.pause()
      setIsPlaying(false)
      setIsPreviewComplete(true)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return

    const newTime = parseFloat(e.target.value)
    // Prevent seeking beyond preview duration
    if (newTime <= previewDuration) {
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    if (currentTime >= previewDuration) {
      setIsPreviewComplete(true)
    }
  }

  const handleLoadStart = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    setIsPreviewComplete(false)
  }

  // Reset preview state when audio URL changes
  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setIsPreviewComplete(false)
  }, [audioUrl])

  const progress = (currentTime / Math.min(duration, previewDuration)) * 100
  const remainingTime = Math.max(0, previewDuration - currentTime)

  return (
    <div className="space-y-4">
      {/* Audio Player */}
      <div className="border rounded-lg p-6 bg-muted/30">
        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={handlePlayPause}
            disabled={isPreviewComplete}
            className="w-16 h-16 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-primary" />
            ) : (
              <Play className="w-8 h-8 text-primary" />
            )}
          </Button>
          
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Volume2 className="w-3 h-3" />
              <span>
                {isPreviewComplete 
                  ? `Preview: ${formatTime(previewDuration)}` 
                  : `Preview: ${formatTime(currentTime)} / ${formatTime(Math.min(duration, previewDuration))}`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={Math.min(duration, previewDuration)}
            value={Math.min(currentTime, previewDuration)}
            onChange={handleSeek}
            disabled={isPreviewComplete}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            style={{
              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%, hsl(var(--muted)) 100%)`
            }}
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(Math.min(currentTime, previewDuration))}</span>
            <span>{formatTime(Math.min(duration, previewDuration))}</span>
          </div>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadStart={handleLoadStart}
          preload="metadata"
        />
      </div>

      {/* Preview Complete Message */}
      {isPreviewComplete && (
        <div className="border rounded-lg p-4 bg-primary/5 border-primary/20">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Volume2 className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-primary">Preview Complete</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              You've listened to {formatTime(previewDuration)} of this {type}. 
              {duration > previewDuration && (
                <span> The full {type} is {formatTime(duration)} long.</span>
              )}
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sign in to listen to the full {type} and discover more music on Rap Arena
            </p>
          </div>
        </div>
      )}

      {/* Preview Info */}
      {!isPreviewComplete && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🎵 Preview: {formatTime(remainingTime)} remaining • 
            Sign in to listen to the full {type}
          </p>
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: hsl(var(--primary));
          cursor: pointer;
          border: 2px solid hsl(var(--background));
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}
