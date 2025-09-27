"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Send } from "lucide-react"
import { CommentInteractions } from "@/components/comment-interactions"

interface Comment {
  id: string
  content: string
  createdAt: string
  likesCount: number
  user: {
    id: string
    name?: string
    username?: string
    image?: string
    tier: number
  }
  replies?: Reply[]
}

interface Reply {
  id: string
  content: string
  createdAt: string
  likesCount: number
  user: {
    id: string
    name?: string
    username?: string
    image?: string
    tier: number
  }
  parent?: {
    id: string
    user: {
      name?: string
      username?: string
    }
  }
}

interface RecordingInteractionsProps {
  recordingId: string
  initialLikesCount?: number
  initialCommentsCount?: number
  showCounts?: boolean
  size?: "sm" | "md" | "lg"
}

export function RecordingInteractions({ 
  recordingId, 
  initialLikesCount = 0, 
  initialCommentsCount = 0,
  showCounts = true,
  size = "md"
}: RecordingInteractionsProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)

  // Fetch like status and counts when component mounts
  useEffect(() => {
    fetchLikeStatus()
  }, [recordingId])

  // Fetch comments when dialog opens
  useEffect(() => {
    if (isCommentsOpen && comments.length === 0) {
      fetchComments()
    }
  }, [isCommentsOpen])

  const fetchLikeStatus = async () => {
    try {
      const response = await fetch(`/api/recordings/${recordingId}/like-status`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
        setCommentsCount(data.commentsCount)
      }
    } catch (error) {
      console.error('Error fetching like status:', error)
    }
  }

  const fetchComments = async () => {
    setIsLoadingComments(true)
    try {
      const response = await fetch(`/api/recordings/${recordingId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const toggleLike = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to like recordings')
      return
    }

    setIsTogglingLike(true)
    try {
      const response = await fetch(`/api/recordings/${recordingId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(data.likesCount)
      } else {
        const error = await response.json()
        console.error('Like toggle error:', error)
        alert(error.details ? `${error.error}: ${error.details}` : error.error || 'Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      alert('Failed to toggle like')
    } finally {
      setIsTogglingLike(false)
    }
  }

  const submitComment = async () => {
    if (!session?.user?.id) {
      alert('Please sign in to comment')
      return
    }

    if (!newComment.trim()) {
      return
    }

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/recordings/${recordingId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [data.comment, ...prev])
        setCommentsCount(prev => prev + 1)
        setNewComment("")
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
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

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "sm"
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4"

  return (
    <div className="flex items-center gap-2">
      {/* Like Button */}
      <Button
        variant="ghost"
        size={buttonSize}
        onClick={toggleLike}
        disabled={isTogglingLike}
        className={`flex items-center gap-1 ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Heart className={`${iconSize} ${isLiked ? 'fill-current' : ''}`} />
        {showCounts && <span>{likesCount}</span>}
      </Button>

      {/* Comments Button */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size={buttonSize}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className={iconSize} />
            {showCounts && <span>{commentsCount}</span>}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Comments ({commentsCount})</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Add Comment */}
            {session?.user && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length}/500
                  </span>
                  <Button
                    onClick={submitComment}
                    disabled={isSubmittingComment || !newComment.trim()}
                    size="sm"
                  >
                    <Send className="h-3 w-3 mr-2" />
                    {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="max-h-96 overflow-y-auto space-y-4">
              {isLoadingComments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 rounded-lg bg-muted/20">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={comment.user.image || "/placeholder.svg"} alt={comment.user.name || comment.user.username} />
                      <AvatarFallback className="text-xs">
                        {(comment.user.name || comment.user.username || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {comment.user.name || comment.user.username}
                        </span>
                        <Badge className={`${getTierColor(comment.user.tier)} text-white text-xs px-1 py-0`}>
                          T{comment.user.tier}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground break-words">{comment.content}</p>
                      <CommentInteractions
                        commentId={comment.id}
                        initialLikesCount={comment.likesCount}
                        replies={comment.replies}
                        onReplyAdded={(reply) => {
                          // Update the comments list with the new reply
                          setComments(prev => prev.map(c => 
                            c.id === comment.id 
                              ? { ...c, replies: [...(c.replies || []), reply] }
                              : c
                          ))
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 