"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star, Music, FileMusic, MessageSquare, Play, Pause, Trophy } from "lucide-react"
import { RecordingInteractions } from "@/components/recording-interactions"
import { PostInteractions } from "@/components/post-interactions"
import Link from "next/link"

interface UserFavoritesProps {
  userId: string
}

interface FavoriteUser {
  id: string
  name?: string
  username?: string
  image?: string
  tier: number
}

interface FavoriteRecording {
  id: string
  title: string
  description?: string
  fileUrl: string
  duration?: number
  likesCount: number
  commentsCount: number
  playsCount: number
  createdAt: string
  user: FavoriteUser
  beat?: {
    id: string
    title: string
    genre?: string
    bpm?: number
  }
}

interface FavoriteBeat {
  id: string
  title: string
  description?: string
  fileUrl: string
  genre?: string
  bpm?: number
  duration?: number
  downloads: number
  createdAt: string
  user: FavoriteUser
}

interface FavoritePost {
  id: string
  content: string
  createdAt: string
  likesCount: number
  commentsCount: number
  type: string
  user: FavoriteUser
  recording?: {
    id: string
    title: string
  }
}

export function UserFavorites({ userId }: UserFavoritesProps) {
  const [recordings, setRecordings] = useState<FavoriteRecording[]>([])
  const [beats, setBeats] = useState<FavoriteBeat[]>([])
  const [posts, setPosts] = useState<FavoritePost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("recordings")
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    fetchFavorites()
  }, [userId])

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/user/${userId}/favorites`)
      if (response.ok) {
        const data = await response.json()
        setRecordings(data.recordings || [])
        setBeats(data.beats || [])
        setPosts(data.posts || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const playAudio = (fileUrl: string, id: string) => {
    // Stop any currently playing audio
    if (playingId && audioElements[playingId]) {
      audioElements[playingId].pause()
      audioElements[playingId].currentTime = 0
    }

    if (playingId === id) {
      setPlayingId(null)
      return
    }

    // Create or get audio element
    let audio = audioElements[id]
    if (!audio) {
      audio = new Audio(fileUrl)
      audio.addEventListener('ended', () => setPlayingId(null))
      setAudioElements(prev => ({ ...prev, [id]: audio }))
    }

    audio.play()
    setPlayingId(id)
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
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
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays}d ago`
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
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
          <Star className="h-5 w-5 text-yellow-500 fill-current" />
          Favorites
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="recordings" className="gap-2">
              <Music className="h-4 w-4" />
              Recordings ({recordings.length})
            </TabsTrigger>
            <TabsTrigger value="beats" className="gap-2">
              <FileMusic className="h-4 w-4" />
              Beats ({beats.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Posts ({posts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recordings" className="space-y-4">
            {recordings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No favorite recordings yet</p>
              </div>
            ) : (
              recordings.map((recording) => (
                <Card key={recording.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => playAudio(recording.fileUrl, recording.id)}
                        className="flex-shrink-0"
                      >
                        {playingId === recording.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/profile/${recording.user.id}`}>
                            <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80">
                              <AvatarImage src={recording.user.image || "/placeholder.svg"} />
                              <AvatarFallback>
                                {(recording.user.name || recording.user.username || 'U').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <Link href={`/profile/${recording.user.id}`} className="text-sm font-medium hover:text-primary">
                            {recording.user.name || recording.user.username}
                          </Link>
                          <Badge className={`${getTierColor(recording.user.tier)} text-white text-xs`}>
                            <Trophy className="w-3 h-3 mr-1" />
                            T{recording.user.tier}
                          </Badge>
                        </div>

                        <h3 className="font-semibold">{recording.title}</h3>
                        {recording.description && (
                          <p className="text-sm text-muted-foreground mt-1">{recording.description}</p>
                        )}
                        {recording.beat && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Beat: {recording.beat.title}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(recording.createdAt)} • {formatDuration(recording.duration)}
                        </p>

                        <div className="mt-3">
                          <RecordingInteractions
                            recordingId={recording.id}
                            initialLikesCount={recording.likesCount}
                            initialCommentsCount={recording.commentsCount}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="beats" className="space-y-4">
            {beats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileMusic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No favorite beats yet</p>
              </div>
            ) : (
              beats.map((beat) => (
                <Card key={beat.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => playAudio(beat.fileUrl, beat.id)}
                        className="flex-shrink-0"
                      >
                        {playingId === beat.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/profile/${beat.user.id}`}>
                            <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80">
                              <AvatarImage src={beat.user.image || "/placeholder.svg"} />
                              <AvatarFallback>
                                {(beat.user.name || beat.user.username || 'U').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <Link href={`/profile/${beat.user.id}`} className="text-sm font-medium hover:text-primary">
                            {beat.user.name || beat.user.username}
                          </Link>
                          <Badge className={`${getTierColor(beat.user.tier)} text-white text-xs`}>
                            <Trophy className="w-3 h-3 mr-1" />
                            T{beat.user.tier}
                          </Badge>
                        </div>

                        <h3 className="font-semibold">{beat.title}</h3>
                        {beat.description && (
                          <p className="text-sm text-muted-foreground mt-1">{beat.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {beat.genre && <span>Genre: {beat.genre}</span>}
                          {beat.bpm && <span>BPM: {beat.bpm}</span>}
                          <span>{beat.downloads} downloads</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(beat.createdAt)} • {formatDuration(beat.duration)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            {posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No favorite posts yet</p>
              </div>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Link href={`/profile/${post.user.id}`}>
                        <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80">
                          <AvatarImage src={post.user.image || "/placeholder.svg"} />
                          <AvatarFallback>
                            {(post.user.name || post.user.username || 'U').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/profile/${post.user.id}`} className="font-semibold hover:text-primary">
                            {post.user.name || post.user.username}
                          </Link>
                          <Badge className={`${getTierColor(post.user.tier)} text-white text-xs`}>
                            <Trophy className="w-3 h-3 mr-1" />
                            T{post.user.tier}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(post.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed mb-3">{post.content}</p>
                    
                    {post.recording && (
                      <div className="bg-muted rounded-lg p-3 mb-3">
                        <p className="text-sm text-muted-foreground">Shared a recording:</p>
                        <p className="font-medium">{post.recording.title}</p>
                      </div>
                    )}

                    <PostInteractions 
                      postId={post.id}
                      initialLikesCount={post.likesCount}
                      initialCommentsCount={post.commentsCount}
                      size="sm"
                    />
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 