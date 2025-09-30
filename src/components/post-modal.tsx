"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Heart, MessageCircle, Share2, Send, Reply, Trophy } from "lucide-react"
import Link from "next/link"

interface PostUser {
  id: string
  name?: string
  username?: string
  image?: string
  tier: number
}

interface Post {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  likesCount: number
  commentsCount: number
  sharesCount: number
  type: string
  user: PostUser
  recording?: {
    id: string
    title: string
    isPublic: boolean
  }
}

interface PostComment {
  id: string
  content: string
  createdAt: string
  likesCount: number
  user: PostUser
  replies: PostComment[]
  parent?: {
    id: string
    user: {
      name?: string
      username?: string
    }
  }
}

interface PostModalProps {
  postId: string | null
  isOpen: boolean
  onClose: () => void
}

export function PostModal({ postId, isOpen, onClose }: PostModalProps) {
  const { data: session } = useSession()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<PostComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    if (isOpen && postId) {
      loadPost()
      loadComments()
      loadLikeStatus()
    }
  }, [isOpen, postId])

  const loadPost = async () => {
    if (!postId) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${postId}`)
      if (response.ok) {
        const data = await response.json()
        setPost(data.post)
      }
    } catch (error) {
      console.error('Error loading post:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    if (!postId) return
    
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

  const loadLikeStatus = async () => {
    if (!postId) return
    
    try {
      const response = await fetch(`/api/posts/${postId}/like-status`)
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
      }
    } catch (error) {
      console.error('Error loading like status:', error)
    }
  }

  const handleLike = async () => {
    if (!postId) return
    
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikesCount(data.likesCount)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !postId) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() })
      })

      if (response.ok) {
        setNewComment("")
        loadComments()
        if (post) {
          setPost({
            ...post,
            commentsCount: post.commentsCount + 1
          })
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleReply = async (parentCommentId: string) => {
    if (!replyContent.trim() || !postId) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/post-comments/${parentCommentId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent.trim() })
      })

      if (response.ok) {
        setReplyContent("")
        setReplyingTo(null)
        loadComments()
        if (post) {
          setPost({
            ...post,
            commentsCount: post.commentsCount + 1
          })
        }
      }
    } catch (error) {
      console.error('Error adding reply:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleCommentLike = async (commentId: string) => {
    try {
      const response = await fetch(`/api/post-comments/${commentId}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        loadComments()
      }
    } catch (error) {
      console.error('Error toggling comment like:', error)
    }
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

  if (!postId) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : post ? (
          <div className="space-y-4">
            {/* Post Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Link href={`/profile/${post.user.id}`} onClick={onClose}>
                  <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80">
                    <AvatarImage src={post.user.image || "/placeholder.svg"} />
                    <AvatarFallback>
                      {(post.user.name || post.user.username || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/profile/${post.user.id}`} onClick={onClose} className="font-semibold hover:text-primary">
                      {post.user.name || post.user.username}
                    </Link>
                    <Badge className={`${getTierColor(post.user.tier)} text-white text-xs`}>
                      <Trophy className="w-3 h-3 mr-1" />
                      T{post.user.tier}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed">{post.content}</p>

              {post.recording && (
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm text-muted-foreground">Shared a recording:</p>
                  <p className="font-medium">{post.recording.title}</p>
                </div>
              )}

              {/* Like/Comment Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? "text-red-500" : ""}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
                  {likesCount}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {post.commentsCount}
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  {post.sharesCount}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Add Comment */}
            {session?.user && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session.user.image || "/placeholder.svg"} />
                  <AvatarFallback>
                    {(session.user.name || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] resize-none"
                    maxLength={500}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {newComment.length}/500
                    </span>
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmittingComment ? "Posting..." : "Comment"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex gap-3">
                    <Link href={`/profile/${comment.user.id}`} onClick={onClose}>
                      <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80">
                        <AvatarImage src={comment.user.image || "/placeholder.svg"} />
                        <AvatarFallback>
                          {(comment.user.name || comment.user.username || 'U').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1 space-y-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Link href={`/profile/${comment.user.id}`} onClick={onClose} className="font-semibold text-sm hover:text-primary">
                            {comment.user.name || comment.user.username}
                          </Link>
                          <Badge className={`${getTierColor(comment.user.tier)} text-white text-xs`}>
                            T{comment.user.tier}
                          </Badge>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatTimeAgo(comment.createdAt)}</span>
                        <button
                          onClick={() => handleCommentLike(comment.id)}
                          className="hover:text-primary transition-colors"
                        >
                          Like ({comment.likesCount})
                        </button>
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="hover:text-primary transition-colors"
                        >
                          Reply
                        </button>
                      </div>

                      {/* Reply Input */}
                      {replyingTo === comment.id && session?.user && (
                        <div className="flex gap-2 mt-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={session.user.image || "/placeholder.svg"} />
                            <AvatarFallback>
                              {(session.user.name || 'U').slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <Textarea
                              placeholder={`Reply to ${comment.user.name || comment.user.username}...`}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="min-h-[60px] resize-none text-sm"
                              maxLength={500}
                            />
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleReply(comment.id)}
                                disabled={!replyContent.trim() || isSubmittingComment}
                              >
                                Reply
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyContent("")
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="space-y-3 ml-4 mt-3 border-l-2 border-muted pl-4">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                              <Link href={`/profile/${reply.user.id}`} onClick={onClose}>
                                <Avatar className="h-6 w-6 cursor-pointer hover:opacity-80">
                                  <AvatarImage src={reply.user.image || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {(reply.user.name || reply.user.username || 'U').slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="flex-1 space-y-1">
                                <div className="bg-muted rounded-lg p-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Link href={`/profile/${reply.user.id}`} onClick={onClose} className="font-semibold text-xs hover:text-primary">
                                      {reply.user.name || reply.user.username}
                                    </Link>
                                    <Badge className={`${getTierColor(reply.user.tier)} text-white text-xs`}>
                                      T{reply.user.tier}
                                    </Badge>
                                  </div>
                                  <p className="text-xs">{reply.content}</p>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{formatTimeAgo(reply.createdAt)}</span>
                                  <button
                                    onClick={() => handleCommentLike(reply.id)}
                                    className="hover:text-primary transition-colors"
                                  >
                                    Like ({reply.likesCount})
                                  </button>
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

              {comments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Post not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 