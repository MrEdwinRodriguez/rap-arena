"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, Trophy, Users, Heart, MessageCircle, Play, Pause, Calendar, Music } from "lucide-react"
import { RecordingInteractions } from "@/components/recording-interactions"
import { FollowButton } from "@/components/follow-button"
import { UserPosts } from "@/components/user-posts"

interface Recording {
  id: string
  title: string
  description?: string
  fileUrl: string
  duration?: number
  votes: number
  likesCount: number
  commentsCount: number
  playsCount: number
  createdAt: string
  user: {
    id: string
    name?: string
    username?: string
    image?: string
    tier: number
  }
  beat?: {
    id: string
    title: string
    genre?: string
    bpm?: number
  }
}

interface UserProfileProps {
  user: {
    id: string
    name?: string
    username?: string
    image?: string
    tier: number
    bio?: string
    totalVotes: number
    createdAt: string
    city?: string
    cityNickname?: string
    hideLocation?: boolean
    hideCityNickname?: boolean
    hideFullName?: boolean
    countryId?: number
    stateId?: number
    stateProvince?: string
    country?: { name: string; code: string }
    state?: { name: string; code: string }
    _count: {
      recordings: number
    }
    followersCount?: number
    followingCount?: number
  }
  recordings: Recording[]
}

export function UserProfile({ user, recordings }: UserProfileProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})
  const [followersCount, setFollowersCount] = useState(user.followersCount || 0)
  const [followingCount, setFollowingCount] = useState(user.followingCount || 0)

  const getTierName = (tier: number) => {
    const tiers = ["Rookie", "Rising", "Skilled", "Elite", "Legend"]
    return tiers[tier - 1] || "Rookie"
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const then = new Date(dateString)
    const diffInDays = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "Yesterday"
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months} month${months > 1 ? 's' : ''} ago`
    } else {
      const years = Math.floor(diffInDays / 365)
      return `${years} year${years > 1 ? 's' : ''} ago`
    }
  }

  const playRecording = (recording: Recording) => {
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

  // Display logic for name/username
  const getDisplayName = () => {
    if (user.hideFullName) {
      return user.username || 'Unknown User'
    }
    return user.name || user.username || 'Unknown User'
  }
  
  const getSecondaryName = () => {
    if (user.hideFullName || !user.name || !user.username) {
      return null
    }
    return user.username
  }
  
  const displayName = getDisplayName()
  const secondaryName = getSecondaryName()

  const handleFollowChange = (isFollowing: boolean, newFollowersCount: number) => {
    setFollowersCount(newFollowersCount)
  }

  return (
    <div className="space-y-8">
      {/* User Profile Header */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.image || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="text-2xl font-serif">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div className="text-center">
                <h1 className="text-3xl font-serif font-bold">{displayName}</h1>
                {secondaryName && (
                  <p className="text-lg text-muted-foreground">@{secondaryName}</p>
                )}
              </div>
              <Badge className={`${getTierColor(user.tier)} text-white`}>
                <Trophy className="w-4 h-4 mr-1" />
                Tier {user.tier} - {getTierName(user.tier)}
              </Badge>
            </div>

            {user.bio && <p className="text-muted-foreground max-w-md">{user.bio}</p>}
            
            {/* Location Information */}
            <div className="text-sm text-muted-foreground space-y-1">
              {!user.hideLocation && (user.city || user.state || user.country) && (
                <div className="flex items-center justify-center gap-1">
                  {[
                    user.city,
                    user.state?.name || user.stateProvince,
                    user.country?.name
                  ].filter(Boolean).join(', ')}
                </div>
              )}
              {!user.hideCityNickname && user.cityNickname && (
                <div className="flex items-center justify-center gap-1">
                  "{user.cityNickname}"
                </div>
              )}
            </div>
            
            {/* Follow Button */}
            <div className="pt-4">
              <FollowButton 
                userId={user.id}
                onFollowChange={handleFollowChange}
                size="lg"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{user._count.recordings}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Mic className="w-4 h-4" />
                Recordings
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{followersCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="w-4 h-4" />
                Followers
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{followingCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="w-4 h-4" />
                Following
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{user.totalVotes}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" />
                Votes
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">
                {recordings.length > 0 ? recordings.reduce((sum, r) => sum + r.likesCount, 0) : 0}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Heart className="w-4 h-4" />
                Likes
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">{formatDate(user.createdAt)}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Posts */}
        <div className="space-y-6">
          <UserPosts 
            userId={user.id} 
            user={{
              id: user.id,
              name: user.name,
              username: user.username,
              image: user.image,
              tier: user.tier
            }} 
          />
        </div>

        {/* Right Column - Public Recordings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Music className="h-5 w-5" />
              Public Recordings
            </h2>
            <span className="text-sm text-muted-foreground">{recordings.length} recordings</span>
          </div>

          {recordings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No public recordings yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recordings.map((recording) => (
                <Card key={recording.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playRecording(recording)}
                        className="w-12 h-12 rounded-full bg-transparent flex-shrink-0"
                        title={playingId === recording.id ? "Pause" : "Play"}
                      >
                        {playingId === recording.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">{recording.title}</h3>
                            {recording.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {recording.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{formatTimeAgo(recording.createdAt)}</span>
                              {recording.beat && (
                                <>
                                  <span>•</span>
                                  <span>Beat: {recording.beat.title}</span>
                                  {recording.beat.genre && (
                                    <>
                                      <span>•</span>
                                      <Badge variant="outline" className="text-xs">
                                        {recording.beat.genre}
                                      </Badge>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                            <RecordingInteractions
                              recordingId={recording.id}
                              initialLikesCount={recording.likesCount}
                              initialCommentsCount={recording.commentsCount}
                              size="sm"
                              recordingInfo={{
                                id: recording.id,
                                title: recording.title,
                                fileUrl: recording.fileUrl,
                                user: recording.user,
                                duration: recording.duration,
                                likesCount: recording.likesCount,
                                commentsCount: recording.commentsCount,
                                playsCount: recording.playsCount,
                                sharesCount: 0, // Add sharesCount when implemented
                                beat: recording.beat
                              }}
                            />
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{recording.playsCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
