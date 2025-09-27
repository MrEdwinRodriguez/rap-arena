"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Send } from "lucide-react"

interface CommentUser {
  id: string
  name?: string
  username?: string
  image?: string
  tier: number
}

interface Reply {
  id: string
  content: string
  createdAt: string
  likesCount: number
  user: CommentUser
  parent?: {
    id: string
    user: {
      name?: string
      username?: string
    }
  }
}

interface CommentInteractionsProps {
  commentId: string
  initialLikesCount?: number
  replies?: Reply[]
  onReplyAdded?: (reply: Reply) => void
  size?: "sm" | "md"
}

export function CommentInteractions({ 
  commentId, 
  initialLikesCount = 0, 
  replies = [],
  onReplyAdded,
  size = "sm"
}: CommentInteractionsProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [showReplyBox, setShowReplyBox] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [newReply, setNewReply] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)

  const toggleLike = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to like comments')
      return
    }

    setIsTogglingLike(true)
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(data.likesCount)
      } else {
        const error = await response.json()
        console.error('Comment like error:', error)
        alert(error.details ? `${error.error}: ${error.details}` : error.error || 'Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling comment like:', error)
      alert('Failed to toggle like')
    } finally {
      setIsTogglingLike(false)
    }
  }

  const submitReply = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to reply')
      return
    }

    if (!newReply.trim()) {
      return
    }

    setIsSubmittingReply(true)
    try {
      const response = await fetch(`/api/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newReply.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        onReplyAdded?.(data.reply)
        setNewReply("")
        setShowReplyBox(false)
        setShowReplies(true)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add reply')
      }
    } catch (error) {
      console.error('Error adding reply:', error)
      alert('Failed to add reply')
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const then = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) {
      return "Just now"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  return (
    <div className="space-y-2">
      {/* Like and Reply Buttons */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLike}
          disabled={isTogglingLike}
          className={`flex items-center gap-1 px-2 py-1 h-auto ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Heart className={`${iconSize} ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-xs">{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReplyBox(!showReplyBox)}
          className="flex items-center gap-1 px-2 py-1 h-auto text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className={iconSize} />
          <span className="text-xs">Reply</span>
        </Button>

        {replies.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 px-2 py-1 h-auto text-muted-foreground hover:text-foreground"
          >
            <span className="text-xs">
              {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </span>
          </Button>
        )}
      </div>

      {/* Reply Input */}
      {showReplyBox && session?.user && (
        <div className="pl-4 space-y-2">
          <Textarea
            placeholder="Write a reply..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            maxLength={500}
            rows={2}
            className="text-sm"
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {newReply.length}/500
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReplyBox(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                onClick={submitReply}
                disabled={isSubmittingReply || !newReply.trim()}
                size="sm"
                className="text-xs"
              >
                <Send className="h-3 w-3 mr-1" />
                {isSubmittingReply ? 'Posting...' : 'Reply'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="pl-4 space-y-3 border-l-2 border-muted">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-2 text-sm">
              <Avatar className="h-6 w-6 flex-shrink-0">
                <AvatarImage src={reply.user.image || "/placeholder.svg"} alt={reply.user.name || reply.user.username} />
                <AvatarFallback className="text-xs">
                  {(reply.user.name || reply.user.username || 'U').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-xs truncate">
                    {reply.user.name || reply.user.username}
                  </span>
                  <Badge className={`${getTierColor(reply.user.tier)} text-white text-xs px-1 py-0`}>
                    T{reply.user.tier}
                  </Badge>
                  {reply.parent && (
                    <span className="text-xs text-muted-foreground">
                      replying to {reply.parent.user.name || reply.parent.user.username}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(reply.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-foreground break-words">{reply.content}</p>
                <CommentInteractions
                  commentId={reply.id}
                  initialLikesCount={reply.likesCount}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 