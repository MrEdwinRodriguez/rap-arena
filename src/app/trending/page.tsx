"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Trophy, Play, Pause, Clock, Users } from "lucide-react"
import RecordingInteractions from "@/components/recording-interactions"
import Link from "next/link"

interface TrendingRecording {
  id: string
  title: string
  description?: string
  fileUrl: string
  duration?: number
  votes: number
  createdAt: string
  user: {
    id: string
    name?: string
    username?: string
    image?: string
  }
  beat?: {
    id: string
    title: string
    genre?: string
    bpm?: number
  }
  // Trending metrics
  trendingScore: number
  recentLikes: number
  recentComments: number
  recentPlays: number
  completedPlays: number
  completionRate: number
  velocityMultiplier: number
  timeDecay: number
  engagementScore: number
}

export default function TrendingPage() {
  const [trendingRecordings, setTrendingRecordings] = useState<TrendingRecording[]>([])
  const [loading, setLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    fetchTrendingRecordings()
  }, [])

  const fetchTrendingRecordings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recordings/trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingRecordings(data.recordings)
      }
    } catch (error) {
      console.error('Error fetching trending recordings:', error)
    } finally {
      setLoading(false)
    }
  }

  const playRecording = (recording: TrendingRecording) => {
    // Stop any currently playing audio
    if (playingId && audioElements[playingId]) {
      audioElements[playingId].pause()
      audioElements[playingId].currentTime = 0
    }

    if (playingId === recording.id) {
      setPlayingId(null)
      return
    }

    // Create or get audio element
    let audio = audioElements[recording.id]
    if (!audio) {
      audio = new Audio(recording.fileUrl)
      audio.addEventListener('ended', () => setPlayingId(null))
      setAudioElements(prev => ({ ...prev, [recording.id]: audio }))
    }

    audio.play()
    setPlayingId(recording.id)
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const then = new Date(dateString)
    const diffInHours = (now.getTime() - then.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <TrendingUp className="inline h-8 w-8 mr-3 text-primary" />
            Trending This Week
          </h1>
          <p className="text-lg text-muted-foreground">
            The hottest tracks based on engagement, plays, and velocity
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : trendingRecordings.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Trending Recordings</h3>
              <p className="text-muted-foreground">
                Check back later for the latest trending tracks!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {trendingRecordings.map((recording, index) => (
                <Card key={recording.id} className="hover:bg-muted/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-8 text-center">
                        <span className="text-2xl font-bold text-primary">#{index + 1}</span>
                      </div>

                      {/* User Avatar */}
                      <Link href={`/profile/${recording.user.id}`}>
                        <Avatar className="h-12 w-12 hover:opacity-80 transition-opacity">
                          <AvatarImage src={recording.user.image || "/placeholder.svg"} alt={recording.user.name} />
                          <AvatarFallback>
                            {(recording.user.name || recording.user.username || 'U').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>

                      {/* Recording Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg truncate">{recording.title}</h3>
                            <Link href={`/profile/${recording.user.id}`} className="text-sm text-muted-foreground hover:text-primary">
                              by {recording.user.name || recording.user.username}
                            </Link>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant="outline" className="text-primary border-primary">
                              <Trophy className="w-3 h-3 mr-1" />
                              {Math.round(recording.trendingScore)} pts
                            </Badge>
                          </div>
                        </div>

                        {recording.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {recording.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recording.duration}s
                          </span>
                          <span>{formatTimeAgo(recording.createdAt)}</span>
                          {recording.beat && (
                            <span>{recording.beat.title}</span>
                          )}
                        </div>

                        {/* Trending Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span>{recording.recentLikes} likes</span>
                          <span>{recording.recentComments} comments</span>
                          <span>{recording.recentPlays} plays</span>
                          <span>{recording.completionRate.toFixed(0)}% completion</span>
                          <span>{recording.velocityMultiplier.toFixed(1)}x velocity</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => playRecording(recording)}
                            className="flex items-center gap-2"
                          >
                            {playingId === recording.id ? (
                              <Pause className="h-3 w-3" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                            {playingId === recording.id ? "Pause" : "Play"}
                          </Button>
                          
                          <RecordingInteractions recordingId={recording.id} />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 