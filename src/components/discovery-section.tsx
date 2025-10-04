"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Zap, Trophy, ArrowRight, Play, Pause, Music } from "lucide-react"
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

interface RisingUser {
  id: string
  name?: string
  username?: string
  image?: string
  tier: number
  bio?: string
  totalVotes: number
  publicRecordings: number
  followersCount: number
  followingCount: number
  risingScore: number
  recentActivity: {
    recordings: number
    followers: number
    likes: number
    comments: number
    plays: number
  }
  accountAgeInDays: number
}

export function DiscoverySection() {
  const [trendingRecordings, setTrendingRecordings] = useState<TrendingRecording[]>([])
  const [risingUsers, setRisingUsers] = useState<RisingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [risingLoading, setRisingLoading] = useState(true)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    fetchTrendingRecordings()
    fetchRisingTalent()
  }, [])

    const fetchTrendingRecordings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recordings/trending')
      if (response.ok) {
        const data = await response.json()
        setTrendingRecordings(data.recordings.slice(0, 20)) // Show top 20 in discovery section
      }
    } catch (error) {
      console.error('Error fetching trending recordings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRisingTalent = async () => {
    try {
      setRisingLoading(true)
      const response = await fetch('/api/users/rising-talent')
      if (response.ok) {
        const data = await response.json()
        setRisingUsers(data.users.slice(0, 20)) // Show top 20 rising users
      }
    } catch (error) {
      console.error('Error fetching rising talent:', error)
      // Fallback to empty array
      setRisingUsers([])
    } finally {
      setRisingLoading(false)
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

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8">
          {/* Trending This Week */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <TrendingUp className="h-5 w-5 text-primary" />
                Trending This Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : trendingRecordings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No trending recordings yet.</p>
                  <p className="text-xs mt-1">Be the first to create some buzz!</p>
                </div>
              ) : (
                <>
                  {trendingRecordings.map((recording, index) => (
                    <div
                      key={recording.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="text-lg font-bold text-muted-foreground w-6">#{index + 1}</div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={recording.user.image || "/placeholder.svg"} alt={recording.user.name || ""} />
                        <AvatarFallback>
                          {recording.user.name ? recording.user.name.slice(0, 2).toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{recording.title}</h4>
                          {recording.velocityMultiplier >= 2 && (
                            <Badge className="bg-red-500 text-white text-xs">🔥 Hot</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{recording.user.name || recording.user.username}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(recording.createdAt)}</span>
                          {recording.beat && (
                            <>
                              <span>•</span>
                              <span>{recording.beat.genre}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <RecordingInteractions
                          recordingId={recording.id}
                          initialLikesCount={recording.recentLikes}
                          initialCommentsCount={recording.recentComments}
                          size="sm"
                          showCounts={false}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            playRecording(recording)
                          }}
                          className="w-8 h-8 p-0"
                          title={playingId === recording.id ? "Pause" : "Play"}
                        >
                          {playingId === recording.id ? (
                            <Pause className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/trending" className="flex items-center justify-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      View Full Trending List
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Rising Talent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif">
                <Zap className="h-5 w-5 text-secondary" />
                Rising Talent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {risingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : risingUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No rising talent found</p>
                </div>
              ) : (
                risingUsers.map((user) => (
                  <Link key={user.id} href={`/profile/${user.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image || "/placeholder.svg"} alt={user.name || user.username} />
                        <AvatarFallback>
                          {(user.name || user.username || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{user.name || user.username}</h4>
                          <Badge className={`${getTierColor(user.tier)} text-white text-xs`}>T{user.tier}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{user.publicRecordings} tracks</span>
                          <span>{user.followersCount} followers</span>
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            {user.risingScore} pts
                          </Badge>
                        </div>
                      </div>
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                  </Link>
                ))
              )}
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/artists" className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  Discover More Artists
                </Link>
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}
