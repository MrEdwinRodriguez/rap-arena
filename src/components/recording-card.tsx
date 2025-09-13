"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Pause,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Send,
  Trophy,
  Zap,
} from "lucide-react"

interface Recording {
  id: string
  user: {
    id: string
    username: string
    avatar: string
    tier: number
  }
  title: string
  duration: number
  likes: number
  dislikes: number
  comments: number
  createdAt: string
  audioUrl: string
  waveformData: number[]
  weightedScore: number
  tierVotes: { [key: number]: { likes: number; dislikes: number } }
}

interface RecordingCardProps {
  recording: Recording
  currentUserTier?: number
}

export function RecordingCard({ recording, currentUserTier = 1 }: RecordingCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [currentTime, setCurrentTime] = useState(0)
  const [showVotingDetails, setShowVotingDetails] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const getTierName = (tier: number) => {
    const tiers = ["Rookie", "Rising", "Skilled", "Elite", "Legend"]
    return tiers[tier - 1] || "Rookie"
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const getTierWeight = (tier: number) => {
    const weights = [1, 2, 4, 7, 12] // Exponential weight increase
    return weights[tier - 1] || 1
  }

  const getVotingPower = () => getTierWeight(currentUserTier)

  const calculateWeightedScore = () => {
    let totalScore = 0
    Object.entries(recording.tierVotes).forEach(([tier, votes]) => {
      const tierNum = Number.parseInt(tier)
      const weight = getTierWeight(tierNum)
      totalScore += (votes.likes - votes.dislikes) * weight
    })
    return totalScore
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    if (isDisliked) setIsDisliked(false)

    // Here you would update the backend with the weighted vote
    console.log(`Vote cast with power: ${getVotingPower()}`)
  }

  const handleDislike = () => {
    setIsDisliked(!isDisliked)
    if (isLiked) setIsLiked(false)

    // Here you would update the backend with the weighted vote
    console.log(`Dislike cast with power: ${getVotingPower()}`)
  }

  const handleComment = () => {
    if (newComment.trim()) {
      console.log("New comment:", newComment)
      setNewComment("")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={recording.user.avatar || "/placeholder.svg"} alt={recording.user.username} />
              <AvatarFallback>{recording.user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{recording.user.username}</h3>
                <Badge className={`${getTierColor(recording.user.tier)} text-white text-xs`}>
                  <Trophy className="w-3 h-3 mr-1" />T{recording.user.tier} {getTierName(recording.user.tier)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{recording.createdAt}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-serif font-bold text-lg mb-2">{recording.title}</h4>

          {/* Audio Player */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">
                  {formatTime(currentTime)} / {formatTime(recording.duration)}
                </div>
                <div className="flex items-end gap-1 h-8">
                  {recording.waveformData.map((height, index) => (
                    <div
                      key={index}
                      className="bg-primary/60 rounded-sm flex-1"
                      style={{ height: `${height * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <audio
              ref={audioRef}
              src={recording.audioUrl}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary font-semibold">
                <Zap className="w-3 h-3 mr-1" />
                Score: {calculateWeightedScore()}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVotingDetails(!showVotingDetails)}
                className="text-xs text-muted-foreground"
              >
                {showVotingDetails ? "Hide" : "Show"} Details
              </Button>
            </div>
            <Badge variant="outline" className="text-xs">
              Your Vote Power: {getVotingPower()}x
            </Badge>
          </div>

          {showVotingDetails && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <h5 className="text-sm font-semibold mb-2">Vote Breakdown by Tier:</h5>
              <div className="space-y-2">
                {Object.entries(recording.tierVotes).map(([tier, votes]) => {
                  const tierNum = Number.parseInt(tier)
                  const weight = getTierWeight(tierNum)
                  const netVotes = votes.likes - votes.dislikes
                  const weightedContribution = netVotes * weight

                  return (
                    <div key={tier} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getTierColor(tierNum)} text-white`} variant="outline">
                          T{tier}
                        </Badge>
                        <span>{getTierName(tierNum)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-600">+{votes.likes}</span>
                        <span className="text-red-600">-{votes.dislikes}</span>
                        <span className="font-semibold">= {weightedContribution} pts</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Interaction Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`gap-2 ${isLiked ? "text-green-600 bg-green-50" : ""}`}
              >
                <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {recording.likes + (isLiked ? 1 : 0)}
                {getVotingPower() > 1 && <span className="text-xs">({getVotingPower()}x)</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDislike}
                className={`gap-2 ${isDisliked ? "text-red-600 bg-red-50" : ""}`}
              >
                <ThumbsDown className={`h-4 w-4 ${isDisliked ? "fill-current" : ""}`} />
                {recording.dislikes + (isDisliked ? 1 : 0)}
                {getVotingPower() > 1 && <span className="text-xs">({getVotingPower()}x)</span>}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="gap-2">
                <MessageCircle className="h-4 w-4" />
                {recording.comments}
              </Button>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>YU</AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleComment()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>BZ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">BeatZone</span>
                      <Badge variant="outline" className="text-xs">
                        T2
                      </Badge>
                      <span className="text-xs text-muted-foreground">1h ago</span>
                    </div>
                    <p className="text-sm">Fire bars! That flow is insane 🔥</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>RL</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">RapLegend</span>
                      <Badge variant="outline" className="text-xs">
                        T4
                      </Badge>
                      <span className="text-xs text-muted-foreground">30m ago</span>
                    </div>
                    <p className="text-sm">Keep grinding, you got potential!</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
