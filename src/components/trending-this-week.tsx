"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  TrendingUp, 
  Play, 
  Pause, 
  Heart, 
  MessageCircle, 
  Eye, 
  Zap,
  Music,
  Clock,
  Flame
} from "lucide-react"

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

export function TrendingThisWeek() {
  const [recordings, setRecordings] = useState<TrendingRecording[]>([])
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
        setRecordings(data.recordings)
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
    
    // TODO: Track play event here when implementing engagement endpoints
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

  const getTrendingBadge = (score: number, velocityMultiplier: number) => {
    if (velocityMultiplier >= 2) {
      return <Badge className="bg-red-500 text-white"><Flame className="w-3 h-3 mr-1" />Hot</Badge>
    } else if (score >= 50) {
      return <Badge className="bg-orange-500 text-white"><TrendingUp className="w-3 h-3 mr-1" />Trending</Badge>
    } else if (score >= 20) {
      return <Badge className="bg-yellow-500 text-white"><Zap className="w-3 h-3 mr-1" />Rising</Badge>
    }
    return <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" />Popular</Badge>
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trending This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Trending This Week
          <Badge variant="outline" className="ml-auto">
            {recordings.length} tracks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recordings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No trending recordings this week yet.</p>
            <p className="text-sm mt-2">Be the first to create some buzz!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recordings.map((recording, index) => (
              <div
                key={recording.id}
                className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-md transition-shadow"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 text-center">
                  {index < 3 ? (
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground font-medium">{index + 1}</span>
                  )}
                </div>

                {/* User Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarImage src={recording.user.image || ""} alt={recording.user.name || ""} />
                  <AvatarFallback className="text-xs">
                    {recording.user.name ? recording.user.name.slice(0, 2).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Recording Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate">{recording.title}</h4>
                    {getTrendingBadge(recording.trendingScore, recording.velocityMultiplier)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{recording.user.name || recording.user.username}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(recording.createdAt)}</span>
                    {recording.beat && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Music className="w-3 h-3" />
                          {recording.beat.title}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Engagement Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1" title="Likes this week">
                    <Heart className="w-3 h-3" />
                    {recording.recentLikes}
                  </div>
                  <div className="flex items-center gap-1" title="Comments this week">
                    <MessageCircle className="w-3 h-3" />
                    {recording.recentComments}
                  </div>
                  <div className="flex items-center gap-1" title="Plays this week">
                    <Eye className="w-3 h-3" />
                    {recording.recentPlays}
                  </div>
                  {recording.completionRate > 0 && (
                    <div className="flex items-center gap-1" title="Completion rate">
                      <Clock className="w-3 h-3" />
                      {Math.round(recording.completionRate)}%
                    </div>
                  )}
                </div>

                {/* Play Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => playRecording(recording)}
                  className="flex-shrink-0 w-8 h-8 p-0"
                  title={playingId === recording.id ? "Pause" : "Play"}
                >
                  {playingId === recording.id ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 