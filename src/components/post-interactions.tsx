"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, MessageCircle, Share2, Send, Reply, MoreHorizontal } from "lucide-react"

interface PostInteractionsProps {
  postId: string
  initialLikesCount?: number
  initialCommentsCount?: number
  size?: "default" | "sm" | "lg"
  postInfo?: {
    id: string
    content: string
    user: {
      id: string
      name?: string
      username?: string
      image?: string
      tier: number
    }
    createdAt: string
    type: string
    recording?: {
      id: string
      title: string
    }
  }
}

interface PostComment {
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
  replies?: PostComment[]
  parent?: {
    id: string
    user: {
      name?: string
      username?: string
    }
  }
}

export function PostInteractions({
  postId,
  initialLikesCount = 0,
  initialCommentsCount = 0,
  size = "default",
  postInfo
}: PostInteractionsProps) {
  const { data: session } = useSession()
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)
  const [comments, setComments] = useState<PostComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")

  // Load initial like status
  useEffect(() => {
    loadLikeStatus()
  }, [postId])

  const loadLikeStatus = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/like-status`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
        setCommentsCount(data.commentsCount)
      }
    } catch (error) {
      console.error('Error loading like status:', error)
    }
  }

  // Load comments when modal opens
  useEffect(() => {
    if (isCommentsOpen) {
      loadComments()
    }
  }, [isCommentsOpen])

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error loading comments:', error)
    }
  }

  const handleLike = async () => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(data.likesCount)
      } else {
        console.error('Failed to toggle like')
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !session?.user?.id) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setCommentsCount(commentsCount + 1)
        setNewComment("")
      } else {
        const errorData = await response.json()
        console.error('Failed to add comment:', errorData.error)
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim() || !session?.user?.id) return

    try {
      const response = await fetch(`/api/post-comments/${parentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: replyContent.trim()
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh comments to show new reply
        loadComments()
        setCommentsCount(commentsCount + 1)
        setReplyingTo(null)
        setReplyContent("")
      } else {
        const errorData = await response.json()
        console.error('Failed to add reply:', errorData.error)
      }
    } catch (error) {
      console.error('Error adding reply:', error)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    if (!session?.user?.id) return

    try {
      const response = await fetch(`/api/post-comments/${commentId}/like`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        // Update the comment in the local state
        setComments(comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, likesCount: data.likesCount }
          }
          // Also check replies
          if (comment.replies) {
            return {
              ...comment,
              replies: comment.replies.map(reply => 
                reply.id === commentId 
                  ? { ...reply, likesCount: data.likesCount }
                  : reply
              )
            }
          }
          return comment
        }))
      } else {
        console.error('Failed to toggle comment like')
      }
    } catch (error) {
      console.error('Error toggling comment like:', error)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const then = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "now"
    if (diffInMinutes < 60) return `${diffInMinutes}m`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d`
  }

  const getTierColor = (tier: number) => {
    const colors = ["bg-gray-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-yellow-500"]
    return colors[tier - 1] || "bg-gray-500"
  }

  const sizeClasses = {
    sm: "h-7 px-2 text-xs",
    default: "h-8 px-3 text-sm",
    lg: "h-9 px-4 text-sm"
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size={size}
          onClick={handleLike}
          className={`${sizeClasses[size]} ${
            isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
          }`}
        >
          <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
          <span>{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size={size}
          onClick={() => setIsCommentsOpen(true)}
          className={`${sizeClasses[size]} text-muted-foreground hover:text-blue-500`}
        >
          <MessageCircle className="w-4 h-4 mr-1" />
          <span>{commentsCount}</span>
        </Button>

        <Button
          variant="ghost"
          size={size}
          className={`${sizeClasses[size]} text-muted-foreground hover:text-green-500`}
        >
          <Share2 className="w-4 h-4 mr-1" />
          <span>0</span>
        </Button>
      </div>

      {/* Comments Modal */}
      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          {/* Post Info Header */}
          {postInfo && (
            <div className="border-b pb-4 mb-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={postInfo.user.image || "/placeholder.svg"} alt={postInfo.user.name} />
                  <AvatarFallback>
                    {(postInfo.user.name || postInfo.user.username || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">{postInfo.user.name || postInfo.user.username}</span>
                    <Badge className={`${getTierColor(postInfo.user.tier)} text-white text-xs`}>
                      T{postInfo.user.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">{postInfo.content}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{likesCount} likes</span>
                    <span>{commentsCount} comments</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                {/* Main Comment */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user.image || "/placeholder.svg"} alt={comment.user.name} />
                    <AvatarFallback className="text-xs">
                      {(comment.user.name || comment.user.username || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{comment.user.name || comment.user.username}</span>
                        <Badge className={`${getTierColor(comment.user.tier)} text-white text-xs`}>
                          T{comment.user.tier}
                        </Badge>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{formatTimeAgo(comment.createdAt)}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-red-500"
                        onClick={() => handleCommentLike(comment.id)}
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        {comment.likesCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-blue-500"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <Reply className="w-3 h-3 mr-1" />
                        Reply
                      </Button>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className="mt-2 flex items-start gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={session?.user?.image || "/placeholder.svg"} alt={session?.user?.name || ""} />
                          <AvatarFallback className="text-xs">
                            {(session?.user?.name || 'U').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder={`Reply to ${comment.user.name || comment.user.username}...`}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="min-h-[60px] text-sm resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyContent.trim()}
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-2 ml-4">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.user.image || "/placeholder.svg"} alt={reply.user.name} />
                              <AvatarFallback className="text-xs">
                                {(reply.user.name || reply.user.username || 'U').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="bg-muted/30 rounded-lg p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-xs">{reply.user.name || reply.user.username}</span>
                                  <Badge className={`${getTierColor(reply.user.tier)} text-white text-xs`}>
                                    T{reply.user.tier}
                                  </Badge>
                                </div>
                                <p className="text-xs">{reply.content}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <span>{formatTimeAgo(reply.createdAt)}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 px-1 text-xs text-muted-foreground hover:text-red-500"
                                  onClick={() => handleCommentLike(reply.id)}
                                >
                                  <Heart className="w-3 h-3 mr-1" />
                                  {reply.likesCount}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Comment */}
          {session?.user && (
            <div className="border-t pt-4 mt-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || "/placeholder.svg"} alt={session.user.name || ""} />
                  <AvatarFallback className="text-sm">
                    {(session.user.name || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                      size="sm"
                    >
                      {isSubmittingComment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {isSubmittingComment ? "Posting..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
} 